import type {
  PresentationExchangeProofFormat,
  PresentationExchangeProposalData,
  PresentationExchangeRequestData,
} from './PresentationExchangeProofFormat'
import type { AgentContext } from '../../../../agent'
import type { Query } from '../../../../storage/StorageService'
import type { W3cCredentialRecord } from '../../../vc'
import type { ProofFormatService } from '../ProofFormatService'
import type {
  FormatAcceptProposalOptions,
  FormatAcceptRequestOptions,
  FormatAutoRespondProposalOptions,
  FormatAutoRespondRequestOptions,
  FormatCreateProposalOptions,
  FormatCreateRequestOptions,
  FormatGetCredentialsForRequestOptions,
  FormatGetCredentialsForRequestReturn,
  FormatProcessPresentationOptions,
  FormatSelectCredentialsForRequestOptions,
  FormatSelectCredentialsForRequestReturn,
  ProofFormatCreateReturn,
  ProofFormatProcessOptions,
} from '../ProofFormatServiceOptions'
import type { PresentationSignCallBackParams, PresentationSignOptions, SubmissionRequirementMatch } from '@sphereon/pex'
import type { IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types'

import { PEXv1, Status } from '@sphereon/pex'
import { Rules } from '@sphereon/pex-models'
import { IProofPurpose } from '@sphereon/ssi-types'
import { query } from 'jsonpath'

import { Attachment, AttachmentData } from '../../../../decorators/attachment/Attachment'
import { AriesFrameworkError } from '../../../../error'
import { JsonTransformer } from '../../../../utils'
import { uuid } from '../../../../utils/uuid'
import { DidResolverService } from '../../../dids'
import { W3cCredentialService, W3cPresentation, W3cVerifiablePresentation } from '../../../vc'
import { ProofFormatSpec } from '../../models/ProofFormatSpec'

const V2_PRESENTATION_EXCHANGE_PRESENTATION_PROPOSAL = 'dif/presentation-exchange/definitions@v1.0'
const V2_PRESENTATION_EXCHANGE_PRESENTATION_REQUEST = 'dif/presentation-exchange/definitions@v1.0'
const V2_PRESENTATION_EXCHANGE_PRESENTATION = 'dif/presentation-exchange/submission@v1.0'

export class PresentationExchangeProofFormatService implements ProofFormatService<PresentationExchangeProofFormat> {
  public readonly formatKey = 'presentationExchange' as const

  public async createProposal(
    agentContext: AgentContext,
    { attachmentId, proofFormats }: FormatCreateProposalOptions<PresentationExchangeProofFormat>
  ): Promise<ProofFormatCreateReturn> {
    const format = new ProofFormatSpec({
      format: V2_PRESENTATION_EXCHANGE_PRESENTATION_PROPOSAL,
      attachmentId,
    })

    const presentationExchangeFormat = proofFormats.presentationExchange
    if (!presentationExchangeFormat) {
      throw Error('Missing presentationExchange format to create proposal attachment format')
    }

    const inputDescriptors = presentationExchangeFormat.inputDescriptors

    const pex = new PEXv1()
    // RFC 0510 only requires input_descriptors, but we can only validate a full definition
    // So we hardcode a random `id` to make it a valid definition
    const result = pex.validateDefinition({
      id: 'presentation-definition-id',
      input_descriptors: inputDescriptors,
    })

    // check if error
    const firstResult = Array.isArray(result) ? result[0] : result
    if (firstResult.status !== Status.INFO) {
      throw new AriesFrameworkError(`Error in presentation exchange inputDescriptors: ${firstResult.message} `)
    }

    const proposalData = {
      input_descriptors: inputDescriptors,
    } satisfies PresentationExchangeProposalData

    const attachment = this.getFormatData(proposalData, format.attachmentId)
    return { format, attachment }
  }

  public async processProposal(agentContext: AgentContext, { attachment }: ProofFormatProcessOptions): Promise<void> {
    const proposalJson = attachment.getDataAsJson<PresentationExchangeProposalData>()

    const pex = new PEXv1()
    // RFC 0510 only requires input_descriptors, but we can only validate a full definition
    // So we hardcode a random `id` to make it a valid definition
    const result = pex.validateDefinition({
      id: 'presentation-definition-id',
      input_descriptors: proposalJson.input_descriptors,
    })

    // check if error
    const firstResult = Array.isArray(result) ? result[0] : result
    if (firstResult.status !== Status.INFO) {
      throw new AriesFrameworkError(`Error in presentation exchange inputDescriptors: ${firstResult.message} `)
    }
  }

  public async acceptProposal(
    agentContext: AgentContext,
    { proposalAttachment, attachmentId, proofFormats }: FormatAcceptProposalOptions<PresentationExchangeProofFormat>
  ): Promise<ProofFormatCreateReturn> {
    const format = new ProofFormatSpec({
      format: V2_PRESENTATION_EXCHANGE_PRESENTATION_REQUEST,
      attachmentId,
    })

    const proposalJson = proposalAttachment.getDataAsJson<PresentationExchangeProposalData>()

    const presentationExchangeFormat = proofFormats?.presentationExchange

    // Challenge and domain are both optional, however, we always create a challenge to avoid replay attacks
    const challenge = presentationExchangeFormat?.options?.challenge ?? uuid()
    const domain = presentationExchangeFormat?.options?.domain

    const requestData = {
      options: {
        challenge,
        domain,
      },
      presentationDefinition: {
        id: uuid(),
        input_descriptors: proposalJson.input_descriptors,
      },
    } satisfies PresentationExchangeRequestData

    const attachment = this.getFormatData(requestData, format.attachmentId)

    return { attachment, format }
  }

  public async createRequest(
    agentContext: AgentContext,
    { attachmentId, proofFormats }: FormatCreateRequestOptions<PresentationExchangeProofFormat>
  ): Promise<ProofFormatCreateReturn> {
    const format = new ProofFormatSpec({
      format: V2_PRESENTATION_EXCHANGE_PRESENTATION_REQUEST,
      attachmentId,
    })

    const presentationExchangeFormat = proofFormats.presentationExchange
    if (!presentationExchangeFormat) {
      throw Error('Missing presentationExchange format to create request attachment format')
    }

    const pex = new PEXv1()
    const result = pex.validateDefinition(presentationExchangeFormat.presentationDefinition)

    // check if error
    const firstResult = Array.isArray(result) ? result[0] : result
    if (firstResult.status !== Status.INFO) {
      throw new AriesFrameworkError(`Error in presentation exchange presentationDefinition: ${firstResult.message} `)
    }

    const requestData = {
      options: {
        challenge: presentationExchangeFormat.options?.challenge ?? uuid(),
        domain: presentationExchangeFormat.options?.domain,
      },
      presentationDefinition: presentationExchangeFormat.presentationDefinition,
    } satisfies PresentationExchangeRequestData

    const attachment = this.getFormatData(requestData, format.attachmentId)

    return { attachment, format }
  }

  public async processRequest(agentContext: AgentContext, { attachment }: ProofFormatProcessOptions): Promise<void> {
    const requestJson = attachment.getDataAsJson<PresentationExchangeRequestData>()

    const pex = new PEXv1()
    const result = pex.validateDefinition(requestJson.presentationDefinition)

    // check if error
    const firstResult = Array.isArray(result) ? result[0] : result
    if (firstResult.status !== Status.INFO) {
      throw new AriesFrameworkError(`Error in presentation exchange presentationDefinition: ${firstResult.message} `)
    }
  }

  public async acceptRequest(
    agentContext: AgentContext,
    { proofFormats, requestAttachment, attachmentId }: FormatAcceptRequestOptions<PresentationExchangeProofFormat>
  ): Promise<ProofFormatCreateReturn> {
    const didResolverService = agentContext.dependencyManager.resolve(DidResolverService)
    const w3cCredentialService = agentContext.dependencyManager.resolve(W3cCredentialService)

    const format = new ProofFormatSpec({
      format: V2_PRESENTATION_EXCHANGE_PRESENTATION,
      attachmentId,
    })

    const pex = new PEXv1()

    const presentationExchangeFormat = proofFormats?.presentationExchange
    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()

    let credentials = presentationExchangeFormat?.credentials

    // User did not provide credentials, we need to select them ourselves
    if (!credentials) {
      // TODO
      credentials = []
    }

    // We use the subject id to resolve the DID document.
    // I am assuming the subject is the same for all credentials (for now)
    // The presentation contains multiple credentials and these are being added
    // TODO how do we derive the verification method if there are multiple subject Ids
    // FIXME: clash between W3cVerifiableCredential and IVerifiableCredential
    const subject = credentials[0].credentialSubject

    // Credential is allowed to be presented without a subject id. In that case we can't prove ownership of credential
    // And it is more like a bearer token.
    // In the future we can first check the holder key and if it exists we can use that as the one that should authenticate
    // https://www.w3.org/TR/vc-data-model/#example-a-credential-issued-to-a-holder-who-is-not-the-only-subject-of-the-credential-who-has-no-relationship-with-the-subject-of-the-credential-but-who-has-a-relationship-with-the-issuer
    if (!subject?.id) {
      throw new AriesFrameworkError(
        'Credential subject missing from the selected credential for creating presentation.'
      )
    }

    if (!subject.id.startsWith('did:')) {
      throw new AriesFrameworkError(`Only dids are supported as credentialSubject id. ${subject.id} is not a valid did`)
    }

    const didDocument = await didResolverService.resolveDidDocument(agentContext, subject.id)
    if (!didDocument.authentication || didDocument.authentication.length === 0) {
      throw new AriesFrameworkError(`No authentication verificationMethods found for did ${subject.id} in did document`)
    }

    // the signature suite to use for the presentation is dependant on the credentials we share.
    // 1. Get the verification method for this given proof purpose in this DID document
    let [verificationMethod] = didDocument.authentication
    if (typeof verificationMethod === 'string') {
      verificationMethod = didDocument.dereferenceKey(verificationMethod, ['authentication'])
    }

    const proofType = w3cCredentialService.getProofTypeByVerificationMethodType(verificationMethod.type)

    // Q1: is holder always subject id, what if there are multiple subjects???
    // Q2: What about proofType, proofPurpose verification method for multiple subjects?
    const params: PresentationSignOptions = {
      holder: subject.id,
      proofOptions: {
        type: proofType,
        proofPurpose: IProofPurpose.authentication,
        challenge: requestJson.options.challenge,
        domain: requestJson.options.domain,
      },
      signatureOptions: {
        verificationMethod: verificationMethod.id,
      },
    }

    const verifiablePresentation = await pex.verifiablePresentationFromAsync(
      requestJson.presentationDefinition,
      credentials,
      // FIXME: pex library has incorrect return type for the PEXv1 class
      // remove ts-ignore when https://github.com/Sphereon-Opensource/PEX/pull/108 is released
      // @ts-ignore
      this.signPresentationCallbackWithAgentContext(agentContext),
      params
    )

    const attachment = this.getFormatData(verifiablePresentation, format.attachmentId)

    return {
      attachment,
      format,
    }
  }

  public async processPresentation(
    agentContext: AgentContext,
    { requestAttachment, attachment }: FormatProcessPresentationOptions
  ): Promise<boolean> {
    const w3cCredentialService = agentContext.dependencyManager.resolve(W3cCredentialService)

    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()
    const presentationJson = attachment.getDataAsJson<IVerifiablePresentation>()
    const signedPresentation = JsonTransformer.fromJSON(presentationJson, W3cVerifiablePresentation)

    // validate contents of presentation
    const pex: PEXv1 = new PEXv1()
    const evaluationResults = pex.evaluatePresentation(requestJson.presentationDefinition, presentationJson)

    // TODO: we need a way to return more information about the error to the framework user.
    if (evaluationResults.areRequiredCredentialsPresent === Status.ERROR) {
      return false
    }

    const verifyResult = await w3cCredentialService.verifyPresentation(agentContext, {
      presentation: signedPresentation,
      challenge: requestJson.options.challenge,
    })

    return verifyResult.verified
  }

  public async getCredentialsForRequest(
    agentContext: AgentContext,
    { requestAttachment }: FormatGetCredentialsForRequestOptions<PresentationExchangeProofFormat>
  ): Promise<FormatGetCredentialsForRequestReturn<PresentationExchangeProofFormat>> {
    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()

    return this._getCredentialsForRequest(agentContext, requestJson)
  }

  public async selectCredentialsForRequest(
    agentContext: AgentContext,
    { requestAttachment }: FormatSelectCredentialsForRequestOptions<PresentationExchangeProofFormat>
  ): Promise<FormatSelectCredentialsForRequestReturn<PresentationExchangeProofFormat>> {
    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()

    const credentialsForRequest = await this._getCredentialsForRequest(agentContext, requestJson)

    if (!credentialsForRequest.matches || !credentialsForRequest.verifiableCredential) {
      throw new AriesFrameworkError('No matches found for presentation request')
    }

    const selectedCredentials: IVerifiableCredential[] = []
    for (const match of credentialsForRequest.matches) {
      selectedCredentials.push(...this.retrieveSelectedCredentials(match, credentialsForRequest.verifiableCredential))
    }

    return {
      credentials: selectedCredentials,
    }
  }

  public async shouldAutoRespondToProposal(
    agentContext: AgentContext,
    { proposalAttachment, requestAttachment }: FormatAutoRespondProposalOptions
  ): Promise<boolean> {
    const proposalJson = proposalAttachment.getDataAsJson<PresentationExchangeProposalData>()
    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()

    // TODO
    return false
  }

  public async shouldAutoRespondToRequest(
    agentContext: AgentContext,
    { proposalAttachment, requestAttachment }: FormatAutoRespondRequestOptions
  ): Promise<boolean> {
    const proposalJson = proposalAttachment.getDataAsJson<PresentationExchangeProposalData>()
    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()

    // TODO
    return false
  }

  public async shouldAutoRespondToPresentation(): Promise<boolean> {
    // The presentation is already verified in processPresentation, so we can just return true here.
    // It's only an ack, so it's just that we received the presentation.
    return true
  }

  public supportsFormat(formatIdentifier: string): boolean {
    const supportedFormats = [
      V2_PRESENTATION_EXCHANGE_PRESENTATION_PROPOSAL,
      V2_PRESENTATION_EXCHANGE_PRESENTATION_REQUEST,
      V2_PRESENTATION_EXCHANGE_PRESENTATION,
    ]
    return supportedFormats.includes(formatIdentifier)
  }

  private retrieveSelectedCredentials(
    match: SubmissionRequirementMatch,
    credentials: IVerifiableCredential[]
  ): IVerifiableCredential[] {
    if (match.rule === Rules.All) {
      return this.ruleAll(match, credentials)
    } else if (match.rule === Rules.Pick) {
      return this.rulePick(match, credentials)
    }

    throw new AriesFrameworkError(`Unsupported rule: ${match.rule}`)
  }

  private ruleAll(match: SubmissionRequirementMatch, credentials: IVerifiableCredential[]): IVerifiableCredential[] {
    const selectedCredentials: IVerifiableCredential[] = []

    if (!match.count) throw new AriesFrameworkError(`PeX Library missing match count`)

    for (let matchIndex = 0; matchIndex < match.count; matchIndex++) {
      // extract [count] verifiable credentials for the given match (expressed as a jsonpath)
      // from the the full list of credentials

      // if we have nested credentials (from_nested is defined) use count as number of recursive calls
      if (match.from_nested) {
        selectedCredentials.push(...this.retrieveSelectedCredentials(match.from_nested[matchIndex], credentials))
      } else {
        selectedCredentials.push(...query({ verifiableCredential: credentials }, match.vc_path[matchIndex]))
      }
    }

    return selectedCredentials
  }

  private rulePick(match: SubmissionRequirementMatch, credentials: IVerifiableCredential[]): IVerifiableCredential[] {
    const selectedCredentials: IVerifiableCredential[] = []

    // extract [count] verifiable credentials for the given match (expressed as a jsonpath)
    // from the the full list of credentials
    if (match.from_nested) {
      // nested query: loop through all sub objects recursively adding to the results array
      for (let i = 0; i < match.from_nested.length; i++) {
        selectedCredentials.push(...this.retrieveSelectedCredentials(match.from_nested[i], credentials))
      }
    } else {
      for (const path of match.vc_path) {
        selectedCredentials.push(...query({ verifiableCredential: credentials }, path))
      }
    }
    return selectedCredentials
  }

  private async _getCredentialsForRequest(
    agentContext: AgentContext,
    presentationRequest: PresentationExchangeRequestData
  ) {
    const w3cCredentialService = agentContext.dependencyManager.resolve(W3cCredentialService)

    const presentationDefinition = presentationRequest.presentationDefinition

    const query: Array<Query<W3cCredentialRecord>> = []
    // The schema.uri can contain either an expanded type, or a context uri
    for (const inputDescriptor of presentationDefinition.input_descriptors) {
      for (const schema of inputDescriptor.schema) {
        query.push({
          $or: [{ expandedType: [schema.uri] }, { contexts: [schema.uri] }],
        })
      }
    }

    // query the wallet ourselves first to avoid the need to query the pex library for all
    // credentials for every proof request
    const credentials = await w3cCredentialService.findCredentialsByQuery(agentContext, {
      $or: query,
    })

    const pexCredentials = credentials.map((c) => JsonTransformer.toJSON(c) as IVerifiableCredential)

    const pex = new PEXv1()
    const selectResults = pex.selectFrom(presentationDefinition, pexCredentials)

    if (selectResults.areRequiredCredentialsPresent === Status.ERROR) {
      throw new AriesFrameworkError(`No matching credentials found: ${selectResults.errors?.['0'].message}`)
    }

    return selectResults
  }

  private signPresentationCallbackWithAgentContext = (agentContext: AgentContext) => {
    const w3cCredentialService = agentContext.dependencyManager.resolve(W3cCredentialService)

    return async (callBackParams: PresentationSignCallBackParams) => {
      // The created partial proof and presentation, as well as original supplied options
      const { presentation: presentationJson, proof, options } = callBackParams

      // extract the originally supplied signature and proof Options
      const { signatureOptions, proofOptions } = options

      if (!proofOptions?.type) {
        throw new AriesFrameworkError('Missing proof type in proof options for signing the presentation.')
      }

      if (!proofOptions?.challenge) {
        throw new AriesFrameworkError('Missing challenge in proof options for signing the presentation.')
      }

      if (!signatureOptions?.verificationMethod) {
        throw new AriesFrameworkError('Missing verification method in proof options for signing the presentation.')
      }

      const presentation = JsonTransformer.fromJSON(presentationJson, W3cPresentation)

      const signedPresentation = await w3cCredentialService.signPresentation(agentContext, {
        presentation,
        purpose: proof.proofPurpose,
        signatureType: proofOptions.type,
        verificationMethod: signatureOptions.verificationMethod,
        challenge: proofOptions.challenge,
      })

      return JsonTransformer.toJSON(signedPresentation) as IVerifiablePresentation
    }
  }

  /**
   * Returns an object of type {@link Attachment} for use in credential exchange messages.
   * It looks up the correct format identifier and encodes the data as a base64 attachment.
   *
   * @param data The data to include in the attach object
   * @param id the attach id from the formats component of the message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getFormatData(data: any, id: string): Attachment {
    const attachment = new Attachment({
      id,
      mimeType: 'application/json',
      data: new AttachmentData({
        json: data,
      }),
    })

    return attachment
  }
}
