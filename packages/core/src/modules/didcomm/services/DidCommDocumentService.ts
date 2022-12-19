import type { AgentContext } from '../../../agent'
import type { DidDocument } from '../../dids/domain'
import type { ResolvedDidCommService } from '../types'

import { InjectionSymbols } from '../../../constants'
import { KeyType } from '../../../crypto'
import { AriesFrameworkError } from '../../../error'
import { Logger } from '../../../logger'
import { inject, injectable } from '../../../plugins'
import { DidRecord, DidRepository, DidResolverService } from '../../dids'
import { DidDocumentRole, DidCommV1Service, IndyAgentService, keyReferenceToKey } from '../../dids/domain'
import { verkeyToInstanceOfKey } from '../../dids/helpers'
import { findMatchingEd25519Key } from '../util/matchingEd25519Key'

@injectable()
export class DidCommDocumentService {
  private didResolverService: DidResolverService
  private didRepository: DidRepository

  public constructor(didResolverService: DidResolverService, didRepository: DidRepository) {
    this.didResolverService = didResolverService
    this.didRepository = didRepository
  }

  public async resolveServicesFromDid(agentContext: AgentContext, did: string): Promise<ResolvedDidCommService[]> {
    const didDocument = await this.didResolverService.resolveDidDocument(agentContext, did)

    const didCommServices: ResolvedDidCommService[] = []

    // FIXME: we currently retrieve did documents for all didcomm services in the did document, and we don't have caching
    // yet so this will re-trigger ledger resolves for each one. Should we only resolve the first service, then the second service, etc...?
    for (const didCommService of didDocument.didCommServices) {
      if (didCommService instanceof IndyAgentService) {
        // IndyAgentService (DidComm v0) has keys encoded as raw publicKeyBase58 (verkeys)
        didCommServices.push({
          id: didCommService.id,
          recipientKeys: didCommService.recipientKeys.map(verkeyToInstanceOfKey),
          routingKeys: didCommService.routingKeys?.map(verkeyToInstanceOfKey) || [],
          serviceEndpoint: didCommService.serviceEndpoint,
        })
      } else if (didCommService instanceof DidCommV1Service) {
        // Resolve dids to DIDDocs to retrieve routingKeys
        const routingKeys = []
        for (const routingKey of didCommService.routingKeys ?? []) {
          const routingDidDocument = await this.didResolverService.resolveDidDocument(agentContext, routingKey)
          routingKeys.push(keyReferenceToKey(routingDidDocument, routingKey))
        }

        // DidCommV1Service has keys encoded as key references

        // Dereference recipientKeys
        const recipientKeys = didCommService.recipientKeys.map((recipientKeyReference) => {
          const key = keyReferenceToKey(didDocument, recipientKeyReference)

          // try to find a matching Ed25519 key (https://sovrin-foundation.github.io/sovrin/spec/did-method-spec-template.html#did-document-notes)
          if (key.keyType === KeyType.X25519) {
            const matchingEd25519Key = findMatchingEd25519Key(key, didDocument)
            if (matchingEd25519Key) return matchingEd25519Key
          }
          return key
        })

        didCommServices.push({
          id: didCommService.id,
          recipientKeys,
          routingKeys,
          serviceEndpoint: didCommService.serviceEndpoint,
        })
      }
    }

    return didCommServices
  }

  public async storeReceivedDidDocument(agentContext: AgentContext, didDocument: DidDocument) {
    let didRecord = await this.didRepository.findById(agentContext, didDocument.id)
    if (didRecord) {
      agentContext.config.logger.debug(
        `Not creating did record for did ${didDocument.id}, because record already exists`
      )
      return
    }

    // Verify the did document contains didcomm services
    if (didDocument.didCommServices.length === 0) {
      throw new AriesFrameworkError(`Did document for did ${didDocument.id} does not contain any didcomm services`)
    }

    didRecord = new DidRecord({
      id: didDocument.id,
      role: DidDocumentRole.Received,
      // We only need to store the did document if it's a did:peer:1 did
      didDocument: didDocument.id.startsWith('did:peer:1') ? didDocument : undefined,
      tags: {
        // We need to save the recipientKeys, so we can find the associated did
        // of a key when we receive a message from another connection.
        recipientKeyFingerprints: didDocument.recipientKeys.map((key) => key.fingerprint),
      },
    })

    await this.didRepository.save(agentContext, didRecord)

    agentContext.config.logger.debug('Saving did record', {
      did: didRecord.id,
      role: didRecord.role,
      tags: didRecord.getTags(),
      didDocument: 'omitted...',
    })
  }

  public containsDidCommService(didDocument: DidDocument): boolean {
    return didDocument.didCommServices.length > 0
  }
}
