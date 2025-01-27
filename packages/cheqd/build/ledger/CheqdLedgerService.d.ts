import type { CheqdSDK, DidStdFee, DIDDocument } from '@cheqd/sdk';
import type { QueryAllDidDocVersionsMetadataResponse, SignInfo } from '@cheqd/ts-proto/cheqd/did/v2';
import type { MsgCreateResourcePayload } from '@cheqd/ts-proto/cheqd/resource/v2';
import type { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import type { DidDocumentMetadata } from '@credo-ts/core';
import { Logger } from '@credo-ts/core';
import { CheqdModuleConfig } from '../CheqdModuleConfig';
export interface ICheqdLedgerConfig {
    network: string;
    rpcUrl: string;
    readonly cosmosPayerWallet: Promise<DirectSecp256k1HdWallet | DirectSecp256k1Wallet>;
    sdk?: Promise<CheqdSDK>;
}
export declare enum DefaultRPCUrl {
    Mainnet = "https://rpc.cheqd.net",
    Testnet = "https://rpc.cheqd.network"
}
export declare class CheqdLedgerService {
    private networks;
    private logger;
    constructor(cheqdSdkModuleConfig: CheqdModuleConfig, logger: Logger);
    connect(): Promise<void>;
    private getSdk;
    private initializeSdkForNetwork;
    create(didPayload: DIDDocument, signInputs: SignInfo[], versionId?: string | undefined, fee?: DidStdFee): Promise<import("@cosmjs/stargate").DeliverTxResponse>;
    update(didPayload: DIDDocument, signInputs: SignInfo[], versionId?: string | undefined, fee?: DidStdFee): Promise<import("@cosmjs/stargate").DeliverTxResponse>;
    deactivate(didPayload: DIDDocument, signInputs: SignInfo[], versionId?: string | undefined, fee?: DidStdFee): Promise<import("@cosmjs/stargate").DeliverTxResponse>;
    resolve(did: string, version?: string): Promise<import("@cheqd/sdk").DIDDocumentWithMetadata>;
    resolveMetadata(did: string): Promise<{
        didDocumentVersionsMetadata: DidDocumentMetadata[];
        pagination: QueryAllDidDocVersionsMetadataResponse['pagination'];
    }>;
    createResource(did: string, resourcePayload: Partial<MsgCreateResourcePayload>, signInputs: SignInfo[], fee?: DidStdFee): Promise<import("@cosmjs/stargate").DeliverTxResponse>;
    resolveResource(did: string, collectionId: string, resourceId: string): Promise<import("@cheqd/ts-proto/cheqd/resource/v2").ResourceWithMetadata>;
    resolveCollectionResources(did: string, collectionId: string): Promise<import("@cheqd/ts-proto/cheqd/resource/v2").QueryCollectionResourcesResponse>;
    resolveResourceMetadata(did: string, collectionId: string, resourceId: string): Promise<import("@cheqd/ts-proto/cheqd/resource/v2").Metadata>;
}
