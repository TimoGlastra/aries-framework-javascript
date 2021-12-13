import type { DidDocument } from '../../dids'

import { AriesFrameworkError } from '../../../error'
import { JsonTransformer } from '../../../utils/JsonTransformer'

const Ed25519SignatureAuthentication2018 = 'Ed25519SignatureAuthentication2018'
const Ed25519VerificationKey2018 = 'Ed25519VerificationKey2018'

export function didDocumentToLegacyDidDocumentFormat(didDocument: DidDocument): Record<string, unknown> {
  const authentication = didDocument.authentication.map((auth) => {
    // referenced verification method
    if (typeof auth === 'string') {
      const verificationMethod = didDocument.verificationMethod.find((v) => v.id === auth)

      if (!verificationMethod) {
        throw new AriesFrameworkError(
          `Did document authentication entry with id ${auth} not found in verificationMethod`
        )
      }

      if (verificationMethod.type !== Ed25519VerificationKey2018) {
        throw new AriesFrameworkError('Only Ed25519VerificationKey2018 key type is supported for legacy did document')
      }

      return {
        publicKey: auth,
        type: Ed25519SignatureAuthentication2018,
      }
    }
    // embedded verification method
    else {
      if (auth.type !== Ed25519VerificationKey2018) {
        throw new AriesFrameworkError('Only Ed25519VerificationKey2018 key type is supported for legacy did document')
      }

      return {
        publicKeyBase58: auth.publicKeyBase58,
        type: auth.type,
        id: auth.id,
        controller: auth.controller,
      }
    }
  })

  const publicKey = didDocument.verificationMethod.map((vMethod) => {
    if (vMethod.type !== Ed25519VerificationKey2018) {
      throw new AriesFrameworkError('Only Ed25519VerificationKey2018 key type is supported for legacy did document')
    }

    return {
      publicKeyBase58: vMethod.publicKeyBase58,
      type: vMethod.type,
      id: vMethod.id,
      controller: vMethod.controller,
    }
  })

  const didDocumentJson = JsonTransformer.toJSON(didDocument)

  return {
    '@context': 'https://w3id.org/did/v1',
    id: didDocument.id,
    publicKey,
    service: didDocumentJson.service ?? [],
    authentication,
  }
}

export function didDocumentFromLegacyDidDocumentFormat(legacyDidFormat: Record<string, any>): DidDocument {
  throw new Error('Not implemented')
}
