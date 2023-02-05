import type { CredentialFormat } from './CredentialFormat'
import type {
  FormatCreateProposalOptions,
  FormatCreateProposalReturn,
  CredentialFormatProcessOptions,
  FormatCreateOfferOptions,
  FormatCreateOfferReturn,
  FormatCreateRequestOptions,
  CredentialFormatCreateReturn,
  FormatAcceptRequestOptions,
  FormatAcceptOfferOptions,
  FormatAcceptProposalOptions,
  FormatAutoRespondCredentialOptions,
  FormatAutoRespondOfferOptions,
  FormatAutoRespondProposalOptions,
  FormatAutoRespondRequestOptions,
  FormatProcessCredentialOptions,
} from './CredentialFormatServiceOptions'
import type { AgentContext } from '../../../agent'

export interface CredentialFormatService<CF extends CredentialFormat = CredentialFormat> {
  formatKey: CF['formatKey']
  credentialRecordType: CF['credentialRecordType']

  // proposal methods
  createProposal(
    agentContext: AgentContext,
    options: FormatCreateProposalOptions<CF>
  ): Promise<FormatCreateProposalReturn>
  processProposal(agentContext: AgentContext, options: CredentialFormatProcessOptions): Promise<void>
  acceptProposal(agentContext: AgentContext, options: FormatAcceptProposalOptions<CF>): Promise<FormatCreateOfferReturn>

  // offer methods
  createOffer(agentContext: AgentContext, options: FormatCreateOfferOptions<CF>): Promise<FormatCreateOfferReturn>
  processOffer(agentContext: AgentContext, options: CredentialFormatProcessOptions): Promise<void>
  acceptOffer(agentContext: AgentContext, options: FormatAcceptOfferOptions<CF>): Promise<CredentialFormatCreateReturn>

  // request methods
  createRequest(
    agentContext: AgentContext,
    options: FormatCreateRequestOptions<CF>
  ): Promise<CredentialFormatCreateReturn>
  processRequest(agentContext: AgentContext, options: CredentialFormatProcessOptions): Promise<void>
  acceptRequest(
    agentContext: AgentContext,
    options: FormatAcceptRequestOptions<CF>
  ): Promise<CredentialFormatCreateReturn>

  // credential methods
  processCredential(agentContext: AgentContext, options: FormatProcessCredentialOptions): Promise<void>

  // auto accept methods
  shouldAutoRespondToProposal(agentContext: AgentContext, options: FormatAutoRespondProposalOptions): Promise<boolean>
  shouldAutoRespondToOffer(agentContext: AgentContext, options: FormatAutoRespondOfferOptions): Promise<boolean>
  shouldAutoRespondToRequest(agentContext: AgentContext, options: FormatAutoRespondRequestOptions): Promise<boolean>
  shouldAutoRespondToCredential(
    agentContext: AgentContext,
    options: FormatAutoRespondCredentialOptions
  ): Promise<boolean>

  deleteCredentialById(agentContext: AgentContext, credentialId: string): Promise<void>

  supportsFormat(formatIdentifier: string): boolean
}
