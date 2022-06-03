import type { AutoAcceptCredential } from './models/CredentialAutoAcceptType'
import type { CredentialFormat, CredentialFormatPayload } from './formats'
import { CredentialService } from './services'

/**
 * Get the supported protocol versions based on the provided credential services.
 */
export type ProtocolVersionType<CFs extends CredentialFormat[], CSs extends CredentialService<CFs>[]> = ReturnType<
  CSs[number]['getVersion']
>

/**
 * Get the service map for usage in the credentials module. Will return a type mapping of protocol version to service.
 *
 * @example
 * ```
 * type CredentialServiceMap = ServiceMap<[IndyCredentialFormat], [V1CredentialService]>
 *
 * // equal to
 * type CredentialServiceMap = {
 *   v1: V1CredentialService
 * }
 * ```
 */
export type ServiceMap<CFs extends CredentialFormat[], CSs extends CredentialService<CFs>[]> = {
  [CS in CSs[number] as ReturnType<CS['getVersion']>]: CredentialService<CFs>
}

interface BaseOptions {
  autoAcceptCredential?: AutoAcceptCredential
  comment?: string
}

/**
 * Interface for CredentialsModule.proposeCredential. Will send a proposal.
 */
export interface ProposeCredentialOptions<CFs extends CredentialFormat[], CSs extends CredentialService<CFs>[]>
  extends BaseOptions {
  connectionId: string
  protocolVersion: ProtocolVersionType<CFs, CSs>
  credentialFormats: CredentialFormatPayload<CFs, 'createProposal'>
}

/**
 * Interface for CredentialsModule.acceptProposal. Will send an offer
 *
 * credentialFormats is optional because this is an accept method
 */
export interface AcceptProposalOptions<CFs extends CredentialFormat[]> extends BaseOptions {
  credentialRecordId: string
  credentialFormats?: CredentialFormatPayload<CFs, 'acceptProposal'>
}

/**
 * Interface for CredentialsModule.negotiateProposal. Will send an offer
 */
export interface NegotiateProposalOptions<CFs extends CredentialFormat[]> extends BaseOptions {
  credentialRecordId: string
  credentialFormats: CredentialFormatPayload<CFs, 'createOffer'>
}

/**
 * Interface for CredentialsModule.createOffer. Will create an out of band offer
 */
export interface CreateOfferOptions<CFs extends CredentialFormat[], CSs extends CredentialService<CFs>[]>
  extends BaseOptions {
  protocolVersion: ProtocolVersionType<CFs, CSs>
  credentialFormats: CredentialFormatPayload<CFs, 'createOffer'>
}

/**
 * Interface for CredentialsModule.offerCredentials. Extends CreateOfferOptions, will send an offer
 */
export interface OfferCredentialOptions<CFs extends CredentialFormat[], CSs extends CredentialService<CFs>[]>
  extends BaseOptions,
    CreateOfferOptions<CFs, CSs> {
  connectionId: string
}

/**
 * Interface for CredentialsModule.acceptOffer. Will send a request
 *
 * credentialFormats is optional because this is an accept method
 */
export interface AcceptOfferOptions<CFs extends CredentialFormat[]> extends BaseOptions {
  credentialRecordId: string
  credentialFormats?: CredentialFormatPayload<CFs, 'acceptOffer'>
}

/**
 * Interface for CredentialsModule.negotiateOffer. Will send a proposal.
 */
export interface NegotiateOfferOptions<CFs extends CredentialFormat[]> {
  credentialRecordId: string
  credentialFormats: CredentialFormatPayload<CFs, 'createProposal'>
}

/**
 * Interface for CredentialsModule.acceptRequest. Will send a credential
 *
 * credentialFormats is optional because this is an accept method
 */
export interface AcceptRequestOptions<CFs extends CredentialFormat[]> extends BaseOptions {
  credentialRecordId: string
  credentialFormats?: CredentialFormatPayload<CFs, 'acceptRequest'>
}
