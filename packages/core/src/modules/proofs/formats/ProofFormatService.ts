import type { ProofFormat } from './ProofFormat'
import type {
  FormatAcceptProposalOptions,
  FormatAcceptRequestOptions,
  FormatCreateProposalOptions,
  FormatCreateRequestOptions,
  FormatProcessPresentationOptions,
  ProofFormatCreateReturn,
  ProofFormatProcessOptions,
  FormatGetCredentialsForRequestOptions,
  FormatGetCredentialsForRequestReturn,
  FormatSelectCredentialsForRequestOptions,
  FormatSelectCredentialsForRequestReturn,
  FormatAutoRespondProposalOptions,
  FormatAutoRespondRequestOptions,
  FormatAutoRespondPresentationOptions,
} from './ProofFormatServiceOptions'
import type { AgentContext } from '../../../agent'

export interface ProofFormatService<PF extends ProofFormat = ProofFormat> {
  formatKey: PF['formatKey']

  // proposal methods
  createProposal(agentContext: AgentContext, options: FormatCreateProposalOptions<PF>): Promise<ProofFormatCreateReturn>
  processProposal(agentContext: AgentContext, options: ProofFormatProcessOptions): Promise<void>
  acceptProposal(agentContext: AgentContext, options: FormatAcceptProposalOptions<PF>): Promise<ProofFormatCreateReturn>

  // request methods
  createRequest(agentContext: AgentContext, options: FormatCreateRequestOptions<PF>): Promise<ProofFormatCreateReturn>
  processRequest(agentContext: AgentContext, options: ProofFormatProcessOptions): Promise<void>
  acceptRequest(agentContext: AgentContext, options: FormatAcceptRequestOptions<PF>): Promise<ProofFormatCreateReturn>

  // presentation methods
  processPresentation(agentContext: AgentContext, options: FormatProcessPresentationOptions): Promise<boolean>

  // credentials for request
  getCredentialsForRequest(
    agentContext: AgentContext,
    options: FormatGetCredentialsForRequestOptions<PF>
  ): Promise<FormatGetCredentialsForRequestReturn<PF>>
  selectCredentialsForRequest(
    agentContext: AgentContext,
    options: FormatSelectCredentialsForRequestOptions<PF>
  ): Promise<FormatSelectCredentialsForRequestReturn<PF>>

  // auto accept methods
  shouldAutoRespondToProposal(agentContext: AgentContext, options: FormatAutoRespondProposalOptions): Promise<boolean>
  shouldAutoRespondToRequest(agentContext: AgentContext, options: FormatAutoRespondRequestOptions): Promise<boolean>
  shouldAutoRespondToPresentation(
    agentContext: AgentContext,
    options: FormatAutoRespondPresentationOptions
  ): Promise<boolean>

  supportsFormat(formatIdentifier: string): boolean
}
