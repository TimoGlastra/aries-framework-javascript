import type { CheqdNetwork, DIDDocument, MethodSpecificIdAlgo, TVerificationKey } from '@cheqd/sdk';
import type { Metadata } from '@cheqd/ts-proto/cheqd/resource/v2';
import { VerificationMethods } from '@cheqd/sdk';
import { EnglishMnemonic as _ } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import { DidDocument } from '@credo-ts/core';
export declare function validateSpecCompliantPayload(didDocument: DidDocument): SpecValidationResult;
export declare function createMsgCreateDidDocPayloadToSign(didPayload: DIDDocument, versionId: string): Promise<Uint8Array>;
export declare function createMsgDeactivateDidDocPayloadToSign(didPayload: DIDDocument, versionId?: string): Uint8Array;
export type SpecValidationResult = {
    valid: boolean;
    error?: string;
};
export declare function generateDidDoc(options: IDidDocOptions): DidDocument;
export interface IDidDocOptions {
    verificationMethod: VerificationMethods;
    verificationMethodId: TVerificationKey<string, number>;
    methodSpecificIdAlgo: MethodSpecificIdAlgo;
    network: CheqdNetwork;
    publicKey: string;
}
export declare function getClosestResourceVersion(resources: Metadata[], date: Date): Metadata;
export declare function filterResourcesByNameAndType(resources: Metadata[], name: string, type: string): Metadata[];
export declare function renderResourceData(data: Uint8Array, mimeType: string): Promise<any>;
export declare class EnglishMnemonic extends _ {
    static readonly _mnemonicMatcher: RegExp;
}
export declare function getCosmosPayerWallet(cosmosPayerSeed?: string): Promise<DirectSecp256k1HdWallet> | Promise<DirectSecp256k1Wallet>;
