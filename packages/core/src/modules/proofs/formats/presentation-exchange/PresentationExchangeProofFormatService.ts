import type {
  PresentationExchangeProofFormat,
  PresentationExchangeProposalData,
  PresentationExchangeRequestData,
} from './PresentationExchangeProofFormat'
import type { AgentContext } from '../../../../agent'
import type { ProofFormatService } from '../ProofFormatService'
import type {
  ProofFormatAcceptProposalOptions,
  ProofFormatAcceptRequestOptions,
  ProofFormatAutoRespondProposalOptions,
  ProofFormatAutoRespondRequestOptions,
  ProofFormatCreateProposalOptions,
  FormatCreateRequestOptions,
  ProofFormatGetCredentialsForRequestOptions,
  ProofFormatGetCredentialsForRequestReturn,
  ProofFormatProcessPresentationOptions,
  ProofFormatSelectCredentialsForRequestOptions,
  ProofFormatSelectCredentialsForRequestReturn,
  ProofFormatCreateReturn,
  ProofFormatProcessOptions,
} from '../ProofFormatServiceOptions'
import type { IVerifiablePresentation } from '@sphereon/ssi-types'

import { Status } from '@sphereon/pex'

import { Attachment, AttachmentData } from '../../../../decorators/attachment/Attachment'
import { deepEquality, JsonTransformer } from '../../../../utils'
import { uuid } from '../../../../utils/uuid'
import { W3cCredentialService, W3cVerifiablePresentation } from '../../../vc'
import { ProofFormatSpec } from '../../models/ProofFormatSpec'

import { PresentationExchangeService } from './PresentationExchangeService'

const V2_PRESENTATION_EXCHANGE_PRESENTATION_PROPOSAL = 'dif/presentation-exchange/definitions@v1.0'
const V2_PRESENTATION_EXCHANGE_PRESENTATION_REQUEST = 'dif/presentation-exchange/definitions@v1.0'
const V2_PRESENTATION_EXCHANGE_PRESENTATION = 'dif/presentation-exchange/submission@v1.0'

export class PresentationExchangeProofFormatService implements ProofFormatService<PresentationExchangeProofFormat> {
  public readonly formatKey = 'presentationExchange' as const

  public async createProposal(
    agentContext: AgentContext,
    { attachmentId, proofFormats }: ProofFormatCreateProposalOptions<PresentationExchangeProofFormat>
  ): Promise<ProofFormatCreateReturn> {
    const pexService = agentContext.dependencyManager.resolve(PresentationExchangeService)
    const format = new ProofFormatSpec({
      format: V2_PRESENTATION_EXCHANGE_PRESENTATION_PROPOSAL,
      attachmentId,
    })

    const presentationExchangeFormat = proofFormats.presentationExchange
    if (!presentationExchangeFormat) {
      throw Error('Missing presentationExchange format to create proposal attachment format')
    }

    const inputDescriptors = presentationExchangeFormat.inputDescriptors

    // RFC 0510 only requires input_descriptors, but we can only validate a full definition
    // So we hardcode a random `id` to make it a valid definition
    pexService.validateDefinition({
      id: 'presentation-definition-id',
      input_descriptors: inputDescriptors,
    })

    const proposalData = {
      input_descriptors: inputDescriptors,
    } satisfies PresentationExchangeProposalData

    const attachment = this.getFormatData(proposalData, format.attachmentId)
    return { format, attachment }
  }

  public async processProposal(agentContext: AgentContext, { attachment }: ProofFormatProcessOptions): Promise<void> {
    const pexService = agentContext.dependencyManager.resolve(PresentationExchangeService)
    const proposalJson = attachment.getDataAsJson<PresentationExchangeProposalData>()

    // RFC 0510 only requires input_descriptors, but we can only validate a full definition
    // So we hardcode a random `id` to make it a valid definition
    pexService.validateDefinition({
      id: 'presentation-definition-id',
      input_descriptors: proposalJson.input_descriptors,
    })
  }

  public async acceptProposal(
    agentContext: AgentContext,
    {
      proposalAttachment,
      attachmentId,
      proofFormats,
    }: ProofFormatAcceptProposalOptions<PresentationExchangeProofFormat>
  ): Promise<ProofFormatCreateReturn> {
    const pexService = agentContext.dependencyManager.resolve(PresentationExchangeService)
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
    const pexService = agentContext.dependencyManager.resolve(PresentationExchangeService)

    const format = new ProofFormatSpec({
      format: V2_PRESENTATION_EXCHANGE_PRESENTATION_REQUEST,
      attachmentId,
    })

    const presentationExchangeFormat = proofFormats.presentationExchange
    if (!presentationExchangeFormat) {
      throw Error('Missing presentationExchange format to create request attachment format')
    }

    pexService.validateDefinition(presentationExchangeFormat.presentationDefinition)

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
    const pexService = agentContext.dependencyManager.resolve(PresentationExchangeService)
    const requestJson = attachment.getDataAsJson<PresentationExchangeRequestData>()

    pexService.validateDefinition(requestJson.presentationDefinition)
  }

  public async acceptRequest(
    agentContext: AgentContext,
    { proofFormats, requestAttachment, attachmentId }: ProofFormatAcceptRequestOptions<PresentationExchangeProofFormat>
  ): Promise<ProofFormatCreateReturn> {
    const pexService = agentContext.dependencyManager.resolve(PresentationExchangeService)

    const format = new ProofFormatSpec({
      format: V2_PRESENTATION_EXCHANGE_PRESENTATION,
      attachmentId,
    })

    const presentationExchangeFormat = proofFormats?.presentationExchange
    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()

    // If user did not provide credentials, we need to select them ourselves based on the request
    const credentials =
      presentationExchangeFormat?.credentials ??
      (await pexService.selectCredentialsForRequest(agentContext, requestJson.presentationDefinition))

    const verifiablePresentation = await pexService.createPresentation(agentContext, {
      presentationDefinition: requestJson.presentationDefinition,
      challenge: requestJson.options.challenge,
      domain: requestJson.options.domain,
      selectedCredentials: credentials,
    })

    const attachment = this.getFormatData(JsonTransformer.toJSON(verifiablePresentation), format.attachmentId)

    return {
      attachment,
      format,
    }
  }

  public async processPresentation(
    agentContext: AgentContext,
    { requestAttachment, attachment }: ProofFormatProcessPresentationOptions
  ): Promise<boolean> {
    const w3cCredentialService = agentContext.dependencyManager.resolve(W3cCredentialService)
    const pexService = agentContext.dependencyManager.resolve(PresentationExchangeService)

    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()
    const presentationJson = attachment.getDataAsJson<IVerifiablePresentation>()
    const signedPresentation = JsonTransformer.fromJSON(presentationJson, W3cVerifiablePresentation)

    // validate contents of presentation
    const evaluationResults = pexService.evaluatePresentation(agentContext, {
      presentation: presentationJson,
      presentationDefinition: requestJson.presentationDefinition,
    })

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
    { requestAttachment }: ProofFormatGetCredentialsForRequestOptions<PresentationExchangeProofFormat>
  ): Promise<ProofFormatGetCredentialsForRequestReturn<PresentationExchangeProofFormat>> {
    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()
    const pexService = agentContext.dependencyManager.resolve(PresentationExchangeService)

    return pexService.getCredentialsForRequest(agentContext, requestJson.presentationDefinition)
  }

  public async selectCredentialsForRequest(
    agentContext: AgentContext,
    { requestAttachment }: ProofFormatSelectCredentialsForRequestOptions<PresentationExchangeProofFormat>
  ): Promise<ProofFormatSelectCredentialsForRequestReturn<PresentationExchangeProofFormat>> {
    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()
    const pexService = agentContext.dependencyManager.resolve(PresentationExchangeService)

    const selectedCredentials = await pexService.selectCredentialsForRequest(
      agentContext,
      requestJson.presentationDefinition
    )

    return {
      credentials: selectedCredentials,
    }
  }

  public async shouldAutoRespondToProposal(
    agentContext: AgentContext,
    { proposalAttachment, requestAttachment }: ProofFormatAutoRespondProposalOptions
  ): Promise<boolean> {
    const proposalJson = proposalAttachment.getDataAsJson<PresentationExchangeProposalData>()
    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()

    // TODO: we should have a more smart comparison here
    return deepEquality(proposalJson.input_descriptors, requestJson.presentationDefinition.input_descriptors)
  }

  public async shouldAutoRespondToRequest(
    agentContext: AgentContext,
    { proposalAttachment, requestAttachment }: ProofFormatAutoRespondRequestOptions
  ): Promise<boolean> {
    const proposalJson = proposalAttachment.getDataAsJson<PresentationExchangeProposalData>()
    const requestJson = requestAttachment.getDataAsJson<PresentationExchangeRequestData>()

    // TODO: we should have a more smart comparison here
    return deepEquality(proposalJson.input_descriptors, requestJson.presentationDefinition.input_descriptors)
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
