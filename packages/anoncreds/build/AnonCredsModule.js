"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsModule = void 0;
const core_1 = require("@credo-ts/core");
const AnonCredsApi_1 = require("./AnonCredsApi");
const AnonCredsModuleConfig_1 = require("./AnonCredsModuleConfig");
const anoncreds_rs_1 = require("./anoncreds-rs");
const AnonCredsDataIntegrityService_1 = require("./anoncreds-rs/AnonCredsDataIntegrityService");
const repository_1 = require("./repository");
const AnonCredsCredentialDefinitionRepository_1 = require("./repository/AnonCredsCredentialDefinitionRepository");
const AnonCredsSchemaRepository_1 = require("./repository/AnonCredsSchemaRepository");
const services_1 = require("./services");
const AnonCredsRegistryService_1 = require("./services/registry/AnonCredsRegistryService");
const _0_3_1_0_4_1 = require("./updates/0.3.1-0.4");
const _0_4_0_5_1 = require("./updates/0.4-0.5");
/**
 * @public
 */
class AnonCredsModule {
    constructor(config) {
        this.api = AnonCredsApi_1.AnonCredsApi;
        this.updates = [
            {
                fromVersion: '0.3.1',
                toVersion: '0.4',
                doUpdate: _0_3_1_0_4_1.updateAnonCredsModuleV0_3_1ToV0_4,
            },
            {
                fromVersion: '0.4',
                toVersion: '0.5',
                doUpdate: _0_4_0_5_1.updateAnonCredsModuleV0_4ToV0_5,
            },
        ];
        this.config = new AnonCredsModuleConfig_1.AnonCredsModuleConfig(config);
    }
    register(dependencyManager) {
        // Config
        dependencyManager.registerInstance(AnonCredsModuleConfig_1.AnonCredsModuleConfig, this.config);
        dependencyManager.registerSingleton(AnonCredsRegistryService_1.AnonCredsRegistryService);
        // Repositories
        dependencyManager.registerSingleton(AnonCredsSchemaRepository_1.AnonCredsSchemaRepository);
        dependencyManager.registerSingleton(AnonCredsCredentialDefinitionRepository_1.AnonCredsCredentialDefinitionRepository);
        dependencyManager.registerSingleton(repository_1.AnonCredsCredentialDefinitionPrivateRepository);
        dependencyManager.registerSingleton(repository_1.AnonCredsKeyCorrectnessProofRepository);
        dependencyManager.registerSingleton(repository_1.AnonCredsLinkSecretRepository);
        dependencyManager.registerSingleton(repository_1.AnonCredsRevocationRegistryDefinitionRepository);
        dependencyManager.registerSingleton(repository_1.AnonCredsRevocationRegistryDefinitionPrivateRepository);
        // TODO: should we allow to override the service?
        dependencyManager.registerSingleton(services_1.AnonCredsHolderServiceSymbol, anoncreds_rs_1.AnonCredsRsHolderService);
        dependencyManager.registerSingleton(services_1.AnonCredsIssuerServiceSymbol, anoncreds_rs_1.AnonCredsRsIssuerService);
        dependencyManager.registerSingleton(services_1.AnonCredsVerifierServiceSymbol, anoncreds_rs_1.AnonCredsRsVerifierService);
        dependencyManager.registerSingleton(core_1.AnonCredsDataIntegrityServiceSymbol, AnonCredsDataIntegrityService_1.AnonCredsDataIntegrityService);
    }
}
exports.AnonCredsModule = AnonCredsModule;
//# sourceMappingURL=AnonCredsModule.js.map