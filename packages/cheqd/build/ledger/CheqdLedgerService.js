"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheqdLedgerService = exports.DefaultRPCUrl = void 0;
const sdk_1 = require("@cheqd/sdk");
const core_1 = require("@credo-ts/core");
const CheqdModuleConfig_1 = require("../CheqdModuleConfig");
const identifiers_1 = require("../anoncreds/utils/identifiers");
const didCheqdUtil_1 = require("../dids/didCheqdUtil");
var DefaultRPCUrl;
(function (DefaultRPCUrl) {
    DefaultRPCUrl["Mainnet"] = "https://rpc.cheqd.net";
    DefaultRPCUrl["Testnet"] = "https://rpc.cheqd.network";
})(DefaultRPCUrl || (exports.DefaultRPCUrl = DefaultRPCUrl = {}));
let CheqdLedgerService = class CheqdLedgerService {
    constructor(cheqdSdkModuleConfig, logger) {
        this.logger = logger;
        this.networks = cheqdSdkModuleConfig.networks.map((config) => {
            const { network, rpcUrl, cosmosPayerSeed } = config;
            return {
                network,
                rpcUrl: rpcUrl ? rpcUrl : network === sdk_1.CheqdNetwork.Mainnet ? DefaultRPCUrl.Mainnet : DefaultRPCUrl.Testnet,
                cosmosPayerWallet: (0, didCheqdUtil_1.getCosmosPayerWallet)(cosmosPayerSeed),
            };
        });
    }
    async connect() {
        for (const network of this.networks) {
            if (!network.sdk) {
                await this.initializeSdkForNetwork(network);
            }
            else {
                this.logger.debug(`Not connecting to network ${network} as SDK already initialized`);
            }
        }
    }
    async getSdk(did) {
        const parsedDid = (0, identifiers_1.parseCheqdDid)(did);
        if (!parsedDid) {
            throw new Error('Invalid DID');
        }
        if (this.networks.length === 0) {
            throw new Error('No cheqd networks configured');
        }
        const network = this.networks.find((network) => network.network === parsedDid.network);
        if (!network) {
            throw new Error(`Network ${network} not found in cheqd networks configuration`);
        }
        if (!network.sdk) {
            const sdk = await this.initializeSdkForNetwork(network);
            if (!sdk)
                throw new Error(`Cheqd SDK not initialized for network ${parsedDid.network}`);
            return sdk;
        }
        try {
            const sdk = await network.sdk;
            return sdk;
        }
        catch (error) {
            throw new Error(`Error initializing cheqd sdk for network ${parsedDid.network}: ${error.message}`);
        }
    }
    async initializeSdkForNetwork(network) {
        try {
            // Initialize cheqd sdk with promise
            network.sdk = (0, sdk_1.createCheqdSDK)({
                modules: [sdk_1.DIDModule, sdk_1.ResourceModule],
                rpcUrl: network.rpcUrl,
                wallet: await network.cosmosPayerWallet.catch((error) => {
                    throw new core_1.CredoError(`Error initializing cosmos payer wallet: ${error.message}`, { cause: error });
                }),
            });
            return await network.sdk;
        }
        catch (error) {
            this.logger.error(`Skipping connection for network ${network.network} in cheqd sdk due to error in initialization: ${error.message}`);
            network.sdk = undefined;
            return undefined;
        }
    }
    async create(didPayload, signInputs, versionId, fee) {
        const sdk = await this.getSdk(didPayload.id);
        return sdk.createDidDocTx(signInputs, didPayload, '', fee, undefined, versionId);
    }
    async update(didPayload, signInputs, versionId, fee) {
        const sdk = await this.getSdk(didPayload.id);
        return sdk.updateDidDocTx(signInputs, didPayload, '', fee, undefined, versionId);
    }
    async deactivate(didPayload, signInputs, versionId, fee) {
        const sdk = await this.getSdk(didPayload.id);
        return sdk.deactivateDidDocTx(signInputs, didPayload, '', fee, undefined, versionId);
    }
    async resolve(did, version) {
        const sdk = await this.getSdk(did);
        return version ? sdk.queryDidDocVersion(did, version) : sdk.queryDidDoc(did);
    }
    async resolveMetadata(did) {
        const sdk = await this.getSdk(did);
        return sdk.queryAllDidDocVersionsMetadata(did);
    }
    async createResource(did, resourcePayload, signInputs, fee) {
        const sdk = await this.getSdk(did);
        return sdk.createLinkedResourceTx(signInputs, resourcePayload, '', fee, undefined);
    }
    async resolveResource(did, collectionId, resourceId) {
        const sdk = await this.getSdk(did);
        return sdk.queryLinkedResource(collectionId, resourceId);
    }
    async resolveCollectionResources(did, collectionId) {
        const sdk = await this.getSdk(did);
        return sdk.queryLinkedResources(collectionId);
    }
    async resolveResourceMetadata(did, collectionId, resourceId) {
        const sdk = await this.getSdk(did);
        return sdk.queryLinkedResourceMetadata(collectionId, resourceId);
    }
};
exports.CheqdLedgerService = CheqdLedgerService;
exports.CheqdLedgerService = CheqdLedgerService = __decorate([
    (0, core_1.injectable)(),
    __param(1, (0, core_1.inject)(core_1.InjectionSymbols.Logger)),
    __metadata("design:paramtypes", [CheqdModuleConfig_1.CheqdModuleConfig, Object])
], CheqdLedgerService);
//# sourceMappingURL=CheqdLedgerService.js.map