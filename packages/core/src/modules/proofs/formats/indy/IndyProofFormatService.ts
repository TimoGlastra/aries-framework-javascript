import type { AgentContext } from '../../../../agent'
import type { ProofAttachmentFormat } from '../../models/ProofAttachmentFormat'
import type {
  FormatRequestedCredentialReturn,
  FormatRetrievedCredentialOptions,
} from '../../models/ProofServiceOptions'
import type {
  ProofFormatAcceptProposalOptions,
  ProofFormatAcceptRequestOptions,
  ProofFormatCreateProposalOptions,
  ProofFormatCreateRequestOptions,
  ProofFormatCreateReturn,
  ProofFormatProcessOptions,
  ProofFormatProcessPresentationOptions,
} from '../ProofFormatServiceOptions'
import type { GetRequestedCredentialsFormat, IndyProofFormat } from './IndyProofFormat'
import type { ProofAttributeInfo, ProofPredicateInfo } from './models'
import type { CredDef, IndyProof, Schema } from 'indy-sdk'

import { inject, Lifecycle, scoped } from 'tsyringe'

import { InjectionSymbols } from '../../../../constants'
import { AriesFrameworkError } from '../../../../error/AriesFrameworkError'
import { Logger } from '../../../../logger'
import { DidCommMessageRepository } from '../../../../storage'
import { checkProofRequestForDuplicates } from '../../../../utils'
import { JsonTransformer } from '../../../../utils/JsonTransformer'
import { MessageValidator } from '../../../../utils/MessageValidator'
import { objectEquals } from '../../../../utils/objectCheck'
import { IndyCredential, IndyCredentialInfo } from '../../../credentials'
import { IndyCredentialUtils } from '../../../credentials/formats/indy/IndyCredentialUtils'
import { IndyHolderService, IndyVerifierService, IndyRevocationService } from '../../../indy'
import { IndyLedgerService } from '../../../ledger'
import { ProofFormatSpec } from '../../models/ProofFormatSpec'
import { PartialProof } from '../../protocol/v1/models'
import { ProofFormatService } from '../ProofFormatService'

import { InvalidEncodedValueError } from './errors/InvalidEncodedValueError'
import { RequestedAttribute, RequestedPredicate } from './models'
import { ProofRequest } from './models/ProofRequest'
import { RequestedCredentials } from './models/RequestedCredentials'
import { RetrievedCredentials } from './models/RetrievedCredentials'

export const INDY_PROOF_REQ = 'hlindy/proof-req@v2.0'
export const INDY_PROOF = 'hlindy/proof@v2.0'

@scoped(Lifecycle.ContainerScoped)
export class IndyProofFormatService extends ProofFormatService {
  private indyHolderService: IndyHolderService
  private indyVerifierService: IndyVerifierService
  private indyRevocationService: IndyRevocationService
  private ledgerService: IndyLedgerService
  private logger: Logger
  private didCommMessageRepository: DidCommMessageRepository

  public constructor(
    indyHolderService: IndyHolderService,
    indyVerifierService: IndyVerifierService,
    indyRevocationService: IndyRevocationService,
    ledgerService: IndyLedgerService,
    @inject(InjectionSymbols.Logger) logger: Logger,
    didCommMessageRepository: DidCommMessageRepository
  ) {
    super()

    this.indyHolderService = indyHolderService
    this.indyVerifierService = indyVerifierService
    this.indyRevocationService = indyRevocationService
    this.ledgerService = ledgerService
    this.logger = logger
    this.didCommMessageRepository = didCommMessageRepository
  }

  public readonly formatKey = 'indy' as const

  public async createProposal(
    agentContext: AgentContext,
    { attachmentId, proofFormats }: ProofFormatCreateProposalOptions<IndyProofFormat>
  ): Promise<ProofFormatCreateReturn> {
    const format = new ProofFormatSpec({
      format: INDY_PROOF_REQ,
      attachmentId,
    })

    const indyFormat = proofFormats.indy

    if (!indyFormat) {
      throw Error('Missing indy format to create proposal attachment format')
    }

    const request = new ProofRequest({
      ...indyFormat,
      nonce: indyFormat.nonce ?? (await agentContext.wallet.generateNonce()),
    })

    // Validation and assert attribute and predicate (group) names do not match
    MessageValidator.validateSync(request)
    checkProofRequestForDuplicates(request)

    const attachment = this.getFormatData(JsonTransformer.toJSON(request), format.attachmentId)

    return {
      format,
      attachment,
    }
  }

  public async processProposal(agentContext: AgentContext, { attachment }: ProofFormatProcessOptions): Promise<void> {
    const proposalJson = attachment.getDataAsJson()

    // fromJson also validates
    const request = JsonTransformer.fromJSON(proposalJson, ProofRequest)

    // Assert attribute and predicate (group) names do not match
    checkProofRequestForDuplicates(request)
  }

  public async acceptProposal(
    agentContext: AgentContext,
    { proofFormats, attachmentId, proposalAttachment }: ProofFormatAcceptProposalOptions<IndyProofFormat>
  ): Promise<ProofFormatCreateReturn> {
    const format = new ProofFormatSpec({
      format: INDY_PROOF_REQ,
      attachmentId,
    })

    const proposal = JsonTransformer.fromJSON(proposalAttachment.getDataAsJson(), ProofRequest)

    let request: ProofRequest

    // If input is provided, we use that
    if (proofFormats?.indy) {
      request = new ProofRequest({
        ...proofFormats.indy,
        nonce: proofFormats.indy.nonce ?? (await agentContext.wallet.generateNonce()),
      })
    }
    // Otherwise we use the proposal as base
    else {
      // We don't want to reuse the nonce from the proposal, as that would possibly allow replay attacks
      request = proposal
      request.nonce = await agentContext.wallet.generateNonce()
    }

    // Validation and assert attribute and predicate (group) names do not match
    MessageValidator.validateSync(request)
    checkProofRequestForDuplicates(request)

    const attachment = this.getFormatData(JsonTransformer.toJSON(request), format.attachmentId)
    return { format, attachment }
  }

  public async createRequest(
    agentContext: AgentContext,
    { attachmentId, proofFormats }: ProofFormatCreateRequestOptions<IndyProofFormat>
  ): Promise<ProofFormatCreateReturn> {
    const format = new ProofFormatSpec({
      format: INDY_PROOF_REQ,
      attachmentId,
    })

    const indyFormat = proofFormats.indy

    if (!indyFormat) {
      throw Error('Missing indy format to create request attachment format')
    }

    const request = new ProofRequest({
      ...indyFormat,
      nonce: indyFormat.nonce ?? (await agentContext.wallet.generateNonce()),
    })

    // Validation and assert attribute and predicate (group) names do not match
    MessageValidator.validateSync(request)
    checkProofRequestForDuplicates(request)

    const attachment = this.getFormatData(JsonTransformer.toJSON(request), format.attachmentId)

    return {
      format,
      attachment,
    }
  }

  public async processRequest(agentContext: AgentContext, { attachment }: ProofFormatProcessOptions): Promise<void> {
    const proposalJson = attachment.getDataAsJson()

    // fromJson also validates
    const request = JsonTransformer.fromJSON(proposalJson, ProofRequest)

    // Assert attribute and predicate (group) names do not match
    checkProofRequestForDuplicates(request)
  }

  public async acceptRequest(
    agentContext: AgentContext,
    { requestAttachment, proofFormats, attachmentId }: ProofFormatAcceptRequestOptions<IndyProofFormat>
  ): Promise<ProofAttachmentFormat> {
    const indyFormat = proofFormats?.indy
    const format = new ProofFormatSpec({
      format: INDY_PROOF,
      attachmentId,
    })

    const request = JsonTransformer.fromJSON(requestAttachment.getDataAsJson(), ProofRequest)

    let requestedCredentials: RequestedCredentials

    if (indyFormat) {
      requestedCredentials = new RequestedCredentials({
        requestedAttributes: indyFormat.requestedAttributes,
        requestedPredicates: indyFormat.requestedPredicates,
        selfAttestedAttributes: indyFormat.selfAttestedAttributes,
      })
    } else {
      // T-TODO: auto select credentials for proof request
      throw new Error('Auto selecting credentials for proof request is not yet implemented')
    }

    MessageValidator.validateSync(requestedCredentials)

    const proof = await this.createProof(agentContext, request, requestedCredentials)
    const attachment = this.getFormatData(proof, format.attachmentId)

    return { format, attachment }
  }

  public async processPresentation(
    agentContext: AgentContext,
    { attachment, requestAttachment }: ProofFormatProcessPresentationOptions
  ): Promise<boolean> {
    const request = JsonTransformer.fromJSON(requestAttachment.getDataAsJson(), ProofRequest)
    const proof = JsonTransformer.fromJSON(attachment.getDataAsJson(), PartialProof)

    return await this.verifyProof(agentContext, { request, proof })
  }

  /**
   * Compare presentation attrs with request/proposal attrs (auto-accept)
   *
   * @param proposalAttachments attachment data from the proposal
   * @param requestAttachments  attachment data from the request
   * @returns boolean value
   */
  public proposalAndRequestAreEqual(
    proposalAttachments: ProofAttachmentFormat[],
    requestAttachments: ProofAttachmentFormat[]
  ) {
    const proposalAttachment = proposalAttachments.find(
      (x) => x.format.format === V2_INDY_PRESENTATION_PROPOSAL
    )?.attachment
    const requestAttachment = requestAttachments.find(
      (x) => x.format.format === V2_INDY_PRESENTATION_REQUEST
    )?.attachment

    if (!proposalAttachment) {
      throw new AriesFrameworkError('Proposal message has no attachment linked to it')
    }

    if (!requestAttachment) {
      throw new AriesFrameworkError('Request message has no attachment linked to it')
    }

    const proposalAttachmentJson = proposalAttachment.getDataAsJson<ProofRequest>()
    const proposalAttachmentData = JsonTransformer.fromJSON(proposalAttachmentJson, ProofRequest)

    const requestAttachmentJson = requestAttachment.getDataAsJson<ProofRequest>()
    const requestAttachmentData = JsonTransformer.fromJSON(requestAttachmentJson, ProofRequest)

    if (
      objectEquals(proposalAttachmentData.requestedAttributes, requestAttachmentData.requestedAttributes) &&
      objectEquals(proposalAttachmentData.requestedPredicates, requestAttachmentData.requestedPredicates)
    ) {
      return true
    }

    return false
  }

  public async getRequestedCredentialsForProofRequest(
    agentContext: AgentContext,
    options: GetRequestedCredentialsFormat
  ): Promise<FormatRetrievedCredentialOptions<[IndyProofFormat]>> {
    const retrievedCredentials = new RetrievedCredentials({})
    const { attachment, presentationProposal } = options
    const filterByNonRevocationRequirements = options.config?.filterByNonRevocationRequirements

    const proofRequestJson = attachment.getDataAsJson<ProofRequest>() ?? null
    const proofRequest = JsonTransformer.fromJSON(proofRequestJson, ProofRequest)

    for (const [referent, requestedAttribute] of proofRequest.requestedAttributes.entries()) {
      let credentialMatch: IndyCredential[] = []
      const credentials = await this.getCredentialsForProofRequest(agentContext, proofRequest, referent)

      // If we have exactly one credential, or no proposal to pick preferences
      // on the credentials to use, we will use the first one
      if (credentials.length === 1 || !presentationProposal) {
        credentialMatch = credentials
      }
      // If we have a proposal we will use that to determine the credentials to use
      else {
        const names = requestedAttribute.names ?? [requestedAttribute.name]

        // Find credentials that matches all parameters from the proposal
        credentialMatch = credentials.filter((credential) => {
          const { attributes, credentialDefinitionId } = credential.credentialInfo

          // Check if credentials matches all parameters from proposal
          return names.every((name) =>
            presentationProposal.attributes.find(
              (a) =>
                a.name === name &&
                a.credentialDefinitionId === credentialDefinitionId &&
                (!a.value || a.value === attributes[name])
            )
          )
        })
      }

      retrievedCredentials.requestedAttributes[referent] = await Promise.all(
        credentialMatch.map(async (credential: IndyCredential) => {
          const { revoked, deltaTimestamp } = await this.getRevocationStatusForRequestedItem(agentContext, {
            proofRequest,
            requestedItem: requestedAttribute,
            credential,
          })

          return new RequestedAttribute({
            credentialId: credential.credentialInfo.referent,
            revealed: true,
            credentialInfo: credential.credentialInfo,
            timestamp: deltaTimestamp,
            revoked,
          })
        })
      )

      // We only attach revoked state if non-revocation is requested. So if revoked is true it means
      // the credential is not applicable to the proof request
      if (filterByNonRevocationRequirements) {
        retrievedCredentials.requestedAttributes[referent] = retrievedCredentials.requestedAttributes[referent].filter(
          (r) => !r.revoked
        )
      }
    }

    for (const [referent, requestedPredicate] of proofRequest.requestedPredicates.entries()) {
      const credentials = await this.getCredentialsForProofRequest(agentContext, proofRequest, referent)

      retrievedCredentials.requestedPredicates[referent] = await Promise.all(
        credentials.map(async (credential) => {
          const { revoked, deltaTimestamp } = await this.getRevocationStatusForRequestedItem(agentContext, {
            proofRequest,
            requestedItem: requestedPredicate,
            credential,
          })

          return new RequestedPredicate({
            credentialId: credential.credentialInfo.referent,
            credentialInfo: credential.credentialInfo,
            timestamp: deltaTimestamp,
            revoked,
          })
        })
      )

      // We only attach revoked state if non-revocation is requested. So if revoked is true it means
      // the credential is not applicable to the proof request
      if (filterByNonRevocationRequirements) {
        retrievedCredentials.requestedPredicates[referent] = retrievedCredentials.requestedPredicates[referent].filter(
          (r) => !r.revoked
        )
      }
    }

    return {
      proofFormats: {
        indy: retrievedCredentials,
      },
    }
  }

  public async autoSelectCredentialsForProofRequest(
    options: FormatRetrievedCredentialOptions<[IndyProofFormat]>
  ): Promise<FormatRequestedCredentialReturn<[IndyProofFormat]>> {
    const { proofFormats } = options
    const indy = proofFormats.indy

    if (!indy) {
      throw new AriesFrameworkError('No indy options provided')
    }

    const requestedCredentials = new RequestedCredentials({})

    Object.keys(indy.requestedAttributes).forEach((attributeName) => {
      const attributeArray = indy.requestedAttributes[attributeName]

      if (attributeArray.length === 0) {
        throw new AriesFrameworkError('Unable to automatically select requested attributes.')
      } else {
        requestedCredentials.requestedAttributes[attributeName] = attributeArray[0]
      }
    })

    Object.keys(indy.requestedPredicates).forEach((attributeName) => {
      if (indy.requestedPredicates[attributeName].length === 0) {
        throw new AriesFrameworkError('Unable to automatically select requested predicates.')
      } else {
        requestedCredentials.requestedPredicates[attributeName] = indy.requestedPredicates[attributeName][0]
      }
    })

    return {
      proofFormats: {
        indy: requestedCredentials,
      },
    }
  }

  public supportsFormat(formatIdentifier: string): boolean {
    const supportedFormats = [INDY_PROOF_REQ, INDY_PROOF]
    return supportedFormats.includes(formatIdentifier)
  }

  private async getCredentialsForProofRequest(
    agentContext: AgentContext,
    proofRequest: ProofRequest,
    attributeReferent: string
  ): Promise<IndyCredential[]> {
    const credentialsJson = await this.indyHolderService.getCredentialsForProofRequest(agentContext, {
      proofRequest: proofRequest.toJSON(),
      attributeReferent,
    })

    return JsonTransformer.fromJSON(credentialsJson, IndyCredential) as unknown as IndyCredential[]
  }

  /**
   * Build credential definitions object needed to create and verify proof objects.
   *
   * Creates object with `{ credentialDefinitionId: CredentialDefinition }` mapping
   *
   * @param credentialDefinitionIds List of credential definition ids
   * @returns Object containing credential definitions for specified credential definition ids
   *
   */
  private async getCredentialDefinitions(agentContext: AgentContext, credentialDefinitionIds: Set<string>) {
    const credentialDefinitions: { [key: string]: CredDef } = {}

    for (const credDefId of credentialDefinitionIds) {
      const credDef = await this.ledgerService.getCredentialDefinition(agentContext, credDefId)
      credentialDefinitions[credDefId] = credDef
    }

    return credentialDefinitions
  }

  /**
   * Build schemas object needed to create and verify proof objects.
   *
   * Creates object with `{ schemaId: Schema }` mapping
   *
   * @param schemaIds List of schema ids
   * @returns Object containing schemas for specified schema ids
   *
   */
  private async getSchemas(agentContext: AgentContext, schemaIds: Set<string>) {
    const schemas: { [key: string]: Schema } = {}

    for (const schemaId of schemaIds) {
      const schema = await this.ledgerService.getSchema(agentContext, schemaId)
      schemas[schemaId] = schema
    }

    return schemas
  }

  /**
   * Create indy proof from a given proof request and requested credential object.
   *
   * @param proofRequest The proof request to create the proof for
   * @param requestedCredentials The requested credentials object specifying which credentials to use for the proof
   * @returns indy proof object
   */
  private async createProof(
    agentContext: AgentContext,
    proofRequest: ProofRequest,
    requestedCredentials: RequestedCredentials
  ): Promise<IndyProof> {
    const requestedItems = [
      ...Object.values(requestedCredentials.requestedAttributes),
      ...Object.values(requestedCredentials.requestedPredicates),
    ]

    const credentialObjects = await Promise.all(
      requestedItems.map(async (c) => {
        if (c.credentialInfo) return c.credentialInfo
        const credentialInfo = await this.indyHolderService.getCredential(agentContext, c.credentialId)
        return JsonTransformer.fromJSON(credentialInfo, IndyCredentialInfo)
      })
    )

    const schemas = await this.getSchemas(agentContext, new Set(credentialObjects.map((c) => c.schemaId)))
    const credentialDefinitions = await this.getCredentialDefinitions(
      agentContext,
      new Set(credentialObjects.map((c) => c.credentialDefinitionId))
    )

    return await this.indyHolderService.createProof(agentContext, {
      proofRequest: proofRequest.toJSON(),
      requestedCredentials: requestedCredentials,
      schemas,
      credentialDefinitions,
    })
  }

  private async verifyProof(
    agentContext: AgentContext,
    {
      request,
      proof,
    }: {
      request: ProofRequest
      proof: PartialProof
    }
  ): Promise<boolean> {
    for (const [referent, attribute] of proof.requestedProof.revealedAttributes.entries()) {
      if (!IndyCredentialUtils.checkValidEncoding(attribute.raw, attribute.encoded)) {
        throw new InvalidEncodedValueError(
          `The encoded value for '${referent}' is invalid. ` +
            `Expected '${IndyCredentialUtils.encode(attribute.raw)}'. ` +
            `Actual '${attribute.encoded}'`
        )
      }
    }

    // TODO: pre verify proof json
    // I'm not 100% sure how much indy does. Also if it checks whether the proof requests matches the proof
    // @see https://github.com/hyperledger/aries-cloudagent-python/blob/master/aries_cloudagent/indy/sdk/verifier.py#L79-L164

    const schemas = await this.getSchemas(agentContext, new Set(proof.identifiers.map((i) => i.schemaId)))
    const credentialDefinitions = await this.getCredentialDefinitions(
      agentContext,
      new Set(proof.identifiers.map((i) => i.credentialDefinitionId))
    )

    return await this.indyVerifierService.verifyProof(agentContext, {
      proofRequest: request.toJSON(),
      proof: proof.toJSON(),
      schemas,
      credentialDefinitions,
    })
  }

  private async getRevocationStatusForRequestedItem(
    agentContext: AgentContext,
    {
      proofRequest,
      requestedItem,
      credential,
    }: {
      proofRequest: ProofRequest
      requestedItem: ProofAttributeInfo | ProofPredicateInfo
      credential: IndyCredential
    }
  ) {
    const requestNonRevoked = requestedItem.nonRevoked ?? proofRequest.nonRevoked
    const credentialRevocationId = credential.credentialInfo.credentialRevocationId
    const revocationRegistryId = credential.credentialInfo.revocationRegistryId

    // If revocation interval is present and the credential is revocable then fetch the revocation status of credentials for display
    if (requestNonRevoked && credentialRevocationId && revocationRegistryId) {
      this.logger.trace(
        `Presentation is requesting proof of non revocation, getting revocation status for credential`,
        {
          requestNonRevoked,
          credentialRevocationId,
          revocationRegistryId,
        }
      )

      // Note presentation from-to's vs ledger from-to's: https://github.com/hyperledger/indy-hipe/blob/master/text/0011-cred-revocation/README.md#indy-node-revocation-registry-intervals
      const status = await this.indyRevocationService.getRevocationStatus(
        agentContext,
        credentialRevocationId,
        revocationRegistryId,
        requestNonRevoked
      )

      return status
    }

    return { revoked: undefined, deltaTimestamp: undefined }
  }
}
