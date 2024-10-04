import type { CheqdNetwork, DidStdFee, TVerificationKey, VerificationMethods } from '@cheqd/sdk';
import type { AgentContext, DidRegistrar, DidCreateOptions, DidCreateResult, DidDeactivateResult, DidUpdateResult, DidUpdateOptions } from '@credo-ts/core';
import { MethodSpecificIdAlgo } from '@cheqd/sdk';
import { MsgCreateResourcePayload } from '@cheqd/ts-proto/cheqd/resource/v2';
import { DidDocument, Buffer } from '@credo-ts/core';
export declare class CheqdDidRegistrar implements DidRegistrar {
    readonly supportedMethods: string[];
    create(agentContext: AgentContext, options: CheqdDidCreateOptions): Promise<DidCreateResult>;
    update(agentContext: AgentContext, options: CheqdDidUpdateOptions): Promise<DidUpdateResult>;
    deactivate(agentContext: AgentContext, options: CheqdDidDeactivateOptions): Promise<DidDeactivateResult>;
    createResource(agentContext: AgentContext, did: string, resource: CheqdCreateResourceOptions): Promise<{
        resourceMetadata: {};
        resourceRegistrationMetadata: {};
        resourceState: {
            state: string;
            reason: string;
            resourceId?: undefined;
            resource?: undefined;
        };
    } | {
        resourceMetadata: {};
        resourceRegistrationMetadata: {};
        resourceState: {
            state: string;
            resourceId: string;
            resource: MsgCreateResourcePayload;
            reason?: undefined;
        };
    }>;
    private signPayload;
}
export interface CheqdDidCreateWithoutDidDocumentOptions extends DidCreateOptions {
    method: 'cheqd';
    did?: undefined;
    didDocument?: undefined;
    options: {
        network: `${CheqdNetwork}`;
        fee?: DidStdFee;
        versionId?: string;
        methodSpecificIdAlgo?: `${MethodSpecificIdAlgo}`;
    };
    secret: {
        verificationMethod: IVerificationMethod;
    };
}
export interface CheqdDidCreateFromDidDocumentOptions extends DidCreateOptions {
    method: 'cheqd';
    did?: undefined;
    didDocument: DidDocument;
    options?: {
        fee?: DidStdFee;
        versionId?: string;
    };
}
export type CheqdDidCreateOptions = CheqdDidCreateFromDidDocumentOptions | CheqdDidCreateWithoutDidDocumentOptions;
export interface CheqdDidUpdateOptions extends DidUpdateOptions {
    did: string;
    didDocument: DidDocument;
    options: {
        fee?: DidStdFee;
        versionId?: string;
    };
    secret?: {
        verificationMethod: IVerificationMethod;
    };
}
export interface CheqdDidDeactivateOptions extends DidCreateOptions {
    method: 'cheqd';
    did: string;
    options: {
        fee?: DidStdFee;
        versionId?: string;
    };
}
export interface CheqdCreateResourceOptions extends Pick<MsgCreateResourcePayload, 'id' | 'name' | 'resourceType'> {
    data: string | Uint8Array | object;
    collectionId?: MsgCreateResourcePayload['collectionId'];
    version?: MsgCreateResourcePayload['version'];
    alsoKnownAs?: MsgCreateResourcePayload['alsoKnownAs'];
}
interface IVerificationMethod {
    type: `${VerificationMethods}`;
    id: TVerificationKey<string, number>;
    privateKey?: Buffer;
}
export {};
