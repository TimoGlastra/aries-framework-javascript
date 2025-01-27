import type { AgentContext, Buffer, DidCreateOptions, DidCreateResult, DidDeactivateResult, DidDocument, DidDocumentService, DidOperationStateActionBase, DidRegistrar, DidUpdateResult } from '@credo-ts/core';
import { Key } from '@credo-ts/core';
export declare class IndyVdrIndyDidRegistrar implements DidRegistrar {
    readonly supportedMethods: string[];
    private didCreateActionResult;
    private didCreateFailedResult;
    private didCreateFinishedResult;
    parseInput(agentContext: AgentContext, options: IndyVdrDidCreateOptions): Promise<ParseInputResult>;
    saveDidRecord(agentContext: AgentContext, did: string, didDocument: DidDocument): Promise<void>;
    private createDidDocument;
    create(agentContext: AgentContext, options: IndyVdrDidCreateOptions): Promise<IndyVdrDidCreateResult>;
    update(): Promise<DidUpdateResult>;
    deactivate(): Promise<DidDeactivateResult>;
    private createRegisterDidWriteRequest;
    private registerPublicDid;
    private createSetDidEndpointsRequest;
    private setEndpointsForDid;
}
interface IndyVdrDidCreateOptionsBase extends DidCreateOptions {
    didDocument?: never;
    options: {
        alias?: string;
        role?: NymRequestRole;
        services?: DidDocumentService[];
        useEndpointAttrib?: boolean;
        verkey?: string;
        endorserDid: string;
        endorserMode: 'internal' | 'external';
        endorsedTransaction?: never;
    };
    secret?: {
        seed?: Buffer;
        privateKey?: Buffer;
    };
}
interface IndyVdrDidCreateOptionsWithDid extends IndyVdrDidCreateOptionsBase {
    method?: never;
    did: string;
}
interface IndyVdrDidCreateOptionsWithoutDid extends IndyVdrDidCreateOptionsBase {
    method: 'indy';
    did?: never;
}
interface IndyVdrDidCreateOptionsForSubmission extends DidCreateOptions {
    didDocument?: never;
    did: string;
    method?: never;
    options: {
        endorserMode: 'external';
        endorsedTransaction: {
            nymRequest: string;
            attribRequest?: string;
        };
    };
    secret?: {
        seed?: Buffer;
        privateKey?: Buffer;
    };
}
export type IndyVdrDidCreateOptions = IndyVdrDidCreateOptionsWithDid | IndyVdrDidCreateOptionsWithoutDid | IndyVdrDidCreateOptionsForSubmission;
type ParseInputOk = {
    status: 'ok';
    did: string;
    verificationKey?: Key;
    namespaceIdentifier: string;
    namespace: string;
    endorserNamespaceIdentifier: string;
    seed: Buffer | undefined;
    privateKey: Buffer | undefined;
};
type parseInputError = {
    status: 'error';
    reason: string;
};
type ParseInputResult = ParseInputOk | parseInputError;
export interface EndorseDidTxAction extends DidOperationStateActionBase {
    action: 'endorseIndyTransaction';
    endorserDid: string;
    nymRequest: string;
    attribRequest?: string;
    did: string;
}
export type IndyVdrDidCreateResult = DidCreateResult<EndorseDidTxAction>;
export type NymRequestRole = 'STEWARD' | 'TRUSTEE' | 'ENDORSER' | 'NETWORK_MONITOR';
export {};
