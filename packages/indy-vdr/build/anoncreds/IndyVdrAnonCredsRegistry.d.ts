import type { AnonCredsRegistry, GetCredentialDefinitionReturn, GetSchemaReturn, RegisterSchemaReturn, RegisterCredentialDefinitionReturn, GetRevocationStatusListReturn, GetRevocationRegistryDefinitionReturn, AnonCredsRevocationRegistryDefinition, RegisterRevocationRegistryDefinitionReturn, RegisterRevocationStatusListReturn, AnonCredsSchema, AnonCredsCredentialDefinition, RegisterSchemaReturnStateFailed, RegisterSchemaReturnStateFinished, RegisterSchemaReturnStateAction, RegisterSchemaReturnStateWait, RegisterCredentialDefinitionReturnStateAction, RegisterCredentialDefinitionReturnStateWait, RegisterCredentialDefinitionReturnStateFinished, RegisterCredentialDefinitionReturnStateFailed, RegisterRevocationRegistryDefinitionReturnStateFinished, RegisterRevocationRegistryDefinitionReturnStateFailed, RegisterRevocationRegistryDefinitionReturnStateWait, RegisterRevocationRegistryDefinitionReturnStateAction, RegisterRevocationStatusListReturnStateFinished, RegisterRevocationStatusListReturnStateFailed, RegisterRevocationStatusListReturnStateWait, RegisterRevocationStatusListReturnStateAction, RegisterRevocationStatusListOptions } from '@credo-ts/anoncreds';
import type { AgentContext } from '@credo-ts/core';
export declare class IndyVdrAnonCredsRegistry implements AnonCredsRegistry {
    readonly methodName = "indy";
    readonly supportedIdentifier: RegExp;
    getSchema(agentContext: AgentContext, schemaId: string): Promise<GetSchemaReturn>;
    registerSchema(agentContext: AgentContext, options: IndyVdrRegisterSchema): Promise<IndyVdrRegisterSchemaReturn>;
    getCredentialDefinition(agentContext: AgentContext, credentialDefinitionId: string): Promise<GetCredentialDefinitionReturn>;
    registerCredentialDefinition(agentContext: AgentContext, options: IndyVdrRegisterCredentialDefinition): Promise<IndyVdrRegisterCredentialDefinitionReturn>;
    getRevocationRegistryDefinition(agentContext: AgentContext, revocationRegistryDefinitionId: string): Promise<GetRevocationRegistryDefinitionReturn>;
    registerRevocationRegistryDefinition(agentContext: AgentContext, { options, revocationRegistryDefinition }: IndyVdrRegisterRevocationRegistryDefinition): Promise<IndyVdrRegisterRevocationRegistryDefinitionReturn>;
    getRevocationStatusList(agentContext: AgentContext, revocationRegistryDefinitionId: string, timestamp: number): Promise<GetRevocationStatusListReturn>;
    registerRevocationStatusList(agentContext: AgentContext, { options, revocationStatusList }: IndyVdrRegisterRevocationStatusList): Promise<IndyVdrRegisterRevocationStatusListReturn>;
    private fetchIndySchemaWithSeqNo;
    private fetchIndyRevocationDelta;
}
type InternalEndorsement = {
    endorserMode: 'internal';
    endorserDid: string;
    endorsedTransaction?: never;
};
type ExternalEndorsementCreate = {
    endorserMode: 'external';
    endorserDid: string;
    endorsedTransaction?: never;
};
type ExternalEndorsementSubmit = {
    endorserMode: 'external';
    endorserDid?: never;
    endorsedTransaction: string;
};
export interface IndyVdrRegisterSchemaInternalOptions {
    schema: AnonCredsSchema;
    options: InternalEndorsement;
}
export interface IndyVdrRegisterSchemaExternalCreateOptions {
    schema: AnonCredsSchema;
    options: ExternalEndorsementCreate;
}
export interface IndyVdrRegisterSchemaExternalSubmitOptions {
    schema: AnonCredsSchema;
    options: ExternalEndorsementSubmit;
}
export interface IndyVdrRegisterSchemaReturnStateAction extends RegisterSchemaReturnStateAction {
    action: 'endorseIndyTransaction';
    schemaRequest: string;
}
export interface IndyVdrRegisterSchemaReturn extends RegisterSchemaReturn {
    schemaState: RegisterSchemaReturnStateWait | IndyVdrRegisterSchemaReturnStateAction | RegisterSchemaReturnStateFinished | RegisterSchemaReturnStateFailed;
}
export type IndyVdrRegisterSchema = IndyVdrRegisterSchemaInternalOptions | IndyVdrRegisterSchemaExternalCreateOptions | IndyVdrRegisterSchemaExternalSubmitOptions;
export type IndyVdrRegisterSchemaOptions = IndyVdrRegisterSchema['options'];
export interface IndyVdrRegisterCredentialDefinitionInternalOptions {
    credentialDefinition: AnonCredsCredentialDefinition;
    options: InternalEndorsement;
}
export interface IndyVdrRegisterCredentialDefinitionExternalCreateOptions {
    credentialDefinition: AnonCredsCredentialDefinition;
    options: ExternalEndorsementCreate;
}
export interface IndyVdrRegisterCredentialDefinitionExternalSubmitOptions {
    credentialDefinition: AnonCredsCredentialDefinition;
    options: ExternalEndorsementSubmit;
}
export interface IndyVdrRegisterCredentialDefinitionReturnStateAction extends RegisterCredentialDefinitionReturnStateAction {
    action: 'endorseIndyTransaction';
    credentialDefinitionRequest: string;
}
export interface IndyVdrRegisterCredentialDefinitionReturn extends RegisterCredentialDefinitionReturn {
    credentialDefinitionState: RegisterCredentialDefinitionReturnStateWait | IndyVdrRegisterCredentialDefinitionReturnStateAction | RegisterCredentialDefinitionReturnStateFinished | RegisterCredentialDefinitionReturnStateFailed;
}
export type IndyVdrRegisterCredentialDefinition = IndyVdrRegisterCredentialDefinitionInternalOptions | IndyVdrRegisterCredentialDefinitionExternalCreateOptions | IndyVdrRegisterCredentialDefinitionExternalSubmitOptions;
export type IndyVdrRegisterCredentialDefinitionOptions = IndyVdrRegisterCredentialDefinition['options'];
export interface IndyVdrRegisterRevocationRegistryDefinitionInternalOptions {
    revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
    options: InternalEndorsement;
}
export interface IndyVdrRegisterRevocationRegistryDefinitionExternalCreateOptions {
    revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
    options: ExternalEndorsementCreate;
}
export interface IndyVdrRegisterRevocationRegistryDefinitionExternalSubmitOptions {
    revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
    options: ExternalEndorsementSubmit;
}
export interface IndyVdrRegisterRevocationRegistryDefinitionReturnStateAction extends RegisterRevocationRegistryDefinitionReturnStateAction {
    action: 'endorseIndyTransaction';
    revocationRegistryDefinitionRequest: string;
}
export interface IndyVdrRegisterRevocationRegistryDefinitionReturn extends RegisterRevocationRegistryDefinitionReturn {
    revocationRegistryDefinitionState: IndyVdrRegisterRevocationRegistryDefinitionReturnStateAction | RegisterRevocationRegistryDefinitionReturnStateWait | RegisterRevocationRegistryDefinitionReturnStateFinished | RegisterRevocationRegistryDefinitionReturnStateFailed;
}
export type IndyVdrRegisterRevocationRegistryDefinition = IndyVdrRegisterRevocationRegistryDefinitionInternalOptions | IndyVdrRegisterRevocationRegistryDefinitionExternalCreateOptions | IndyVdrRegisterRevocationRegistryDefinitionExternalSubmitOptions;
export type IndyVdrRegisterRevocationRegistryDefinitionOptions = IndyVdrRegisterRevocationRegistryDefinition['options'];
export interface IndyVdrRegisterRevocationStatusListInternalOptions extends RegisterRevocationStatusListOptions {
    options: InternalEndorsement;
}
export interface IndyVdrRegisterRevocationStatusListExternalCreateOptions extends RegisterRevocationStatusListOptions {
    options: ExternalEndorsementCreate;
}
export interface IndyVdrRegisterRevocationStatusListExternalSubmitOptions extends RegisterRevocationStatusListOptions {
    options: ExternalEndorsementSubmit;
}
export interface IndyVdrRegisterRevocationStatusListReturnStateAction extends RegisterRevocationStatusListReturnStateAction {
    action: 'endorseIndyTransaction';
    revocationStatusListRequest: string;
}
export interface IndyVdrRegisterRevocationStatusListReturn extends RegisterRevocationStatusListReturn {
    revocationStatusListState: IndyVdrRegisterRevocationStatusListReturnStateAction | RegisterRevocationStatusListReturnStateWait | RegisterRevocationStatusListReturnStateFinished | RegisterRevocationStatusListReturnStateFailed;
}
export type IndyVdrRegisterRevocationStatusList = IndyVdrRegisterRevocationStatusListInternalOptions | IndyVdrRegisterRevocationStatusListExternalCreateOptions | IndyVdrRegisterRevocationStatusListExternalSubmitOptions;
export type IndyVdrRegisterRevocationStatusListOptions = IndyVdrRegisterRevocationStatusList['options'];
export {};
