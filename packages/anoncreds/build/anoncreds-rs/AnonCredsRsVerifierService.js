"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRsVerifierService = void 0;
const core_1 = require("@credo-ts/core");
const anoncreds_shared_1 = require("@hyperledger/anoncreds-shared");
const utils_1 = require("../utils");
const utils_2 = require("./utils");
let AnonCredsRsVerifierService = class AnonCredsRsVerifierService {
    constructor() {
        this.getRevocationMetadataForCredentials = async (agentContext, credentialsWithMetadata) => {
            const revocationMetadataFetchPromises = credentialsWithMetadata
                .filter((cwm) => cwm.nonRevoked)
                .map(async (credentialWithMetadata) => {
                const w3cJsonLdVerifiableCredential = core_1.JsonTransformer.toJSON(credentialWithMetadata.credential);
                const { revocationRegistryIndex, revocationRegistryId, timestamp } = anoncreds_shared_1.W3cCredential.fromJson(w3cJsonLdVerifiableCredential);
                return await (0, utils_2.getRevocationMetadata)(agentContext, {
                    nonRevokedInterval: credentialWithMetadata.nonRevoked,
                    timestamp: timestamp,
                    revocationRegistryId,
                    revocationRegistryIndex,
                });
            });
            return await Promise.all(revocationMetadataFetchPromises);
        };
    }
    async verifyProof(agentContext, options) {
        const { credentialDefinitions, proof, proofRequest, revocationRegistries, schemas } = options;
        let presentation;
        try {
            // Check that provided timestamps correspond to the active ones from the VDR. If they are and differ from the originally
            // requested ones, create overrides for anoncreds-rs to consider them valid
            const { verified, nonRevokedIntervalOverrides } = await this.verifyTimestamps(agentContext, proof, proofRequest);
            // No need to call anoncreds-rs as we already know that the proof will not be valid
            if (!verified) {
                agentContext.config.logger.debug('Invalid timestamps for provided identifiers');
                return false;
            }
            presentation = anoncreds_shared_1.Presentation.fromJson(proof);
            const rsCredentialDefinitions = {};
            for (const credDefId in credentialDefinitions) {
                rsCredentialDefinitions[credDefId] = credentialDefinitions[credDefId];
            }
            const rsSchemas = {};
            for (const schemaId in schemas) {
                rsSchemas[schemaId] = schemas[schemaId];
            }
            const revocationRegistryDefinitions = {};
            const lists = [];
            for (const revocationRegistryDefinitionId in revocationRegistries) {
                const { definition, revocationStatusLists } = options.revocationRegistries[revocationRegistryDefinitionId];
                revocationRegistryDefinitions[revocationRegistryDefinitionId] = definition;
                lists.push(...Object.values(revocationStatusLists));
            }
            return presentation.verify({
                presentationRequest: proofRequest,
                credentialDefinitions: rsCredentialDefinitions,
                schemas: rsSchemas,
                revocationRegistryDefinitions,
                revocationStatusLists: lists,
                nonRevokedIntervalOverrides,
            });
        }
        finally {
            presentation === null || presentation === void 0 ? void 0 : presentation.handle.clear();
        }
    }
    async verifyTimestamps(agentContext, proof, proofRequest) {
        var _a, _b;
        const nonRevokedIntervalOverrides = [];
        // Override expected timestamps if the requested ones don't exacly match the values from VDR
        const globalNonRevokedInterval = proofRequest.non_revoked;
        const requestedNonRevokedRestrictions = [];
        for (const value of [
            ...Object.values(proofRequest.requested_attributes),
            ...Object.values(proofRequest.requested_predicates),
        ]) {
            const nonRevokedInterval = (_a = value.non_revoked) !== null && _a !== void 0 ? _a : globalNonRevokedInterval;
            if (nonRevokedInterval) {
                (_b = value.restrictions) === null || _b === void 0 ? void 0 : _b.forEach((restriction) => requestedNonRevokedRestrictions.push({
                    nonRevokedInterval,
                    schemaId: restriction.schema_id,
                    credentialDefinitionId: restriction.cred_def_id,
                    revocationRegistryDefinitionId: restriction.rev_reg_id,
                }));
            }
        }
        for (const identifier of proof.identifiers) {
            if (!identifier.timestamp || !identifier.rev_reg_id) {
                continue;
            }
            const relatedNonRevokedRestrictionItem = requestedNonRevokedRestrictions.find((item) => item.revocationRegistryDefinitionId === item.revocationRegistryDefinitionId ||
                item.credentialDefinitionId === identifier.cred_def_id ||
                item.schemaId === item.schemaId);
            const requestedFrom = relatedNonRevokedRestrictionItem === null || relatedNonRevokedRestrictionItem === void 0 ? void 0 : relatedNonRevokedRestrictionItem.nonRevokedInterval.from;
            if (requestedFrom && requestedFrom > identifier.timestamp) {
                // Check VDR if the active revocation status list at requestedFrom was the one from provided timestamp.
                // If it matches, add to the override list
                const { revocationStatusList } = await (0, utils_1.fetchRevocationStatusList)(agentContext, identifier.rev_reg_id, requestedFrom);
                const vdrTimestamp = revocationStatusList === null || revocationStatusList === void 0 ? void 0 : revocationStatusList.timestamp;
                if (vdrTimestamp && vdrTimestamp === identifier.timestamp) {
                    nonRevokedIntervalOverrides.push({
                        overrideRevocationStatusListTimestamp: identifier.timestamp,
                        requestedFromTimestamp: requestedFrom,
                        revocationRegistryDefinitionId: identifier.rev_reg_id,
                    });
                }
                else {
                    agentContext.config.logger.debug(`VDR timestamp for ${requestedFrom} does not correspond to the one provided in proof identifiers. Expected: ${identifier.timestamp} and received ${vdrTimestamp}`);
                    return { verified: false };
                }
            }
        }
        return {
            verified: true,
            nonRevokedIntervalOverrides: nonRevokedIntervalOverrides.length ? nonRevokedIntervalOverrides : undefined,
        };
    }
    async verifyW3cPresentation(agentContext, options) {
        const revocationMetadata = await this.getRevocationMetadataForCredentials(agentContext, options.credentialsWithRevocationMetadata);
        const revocationRegistryDefinitions = {};
        revocationMetadata.forEach((rm) => (revocationRegistryDefinitions[rm.revocationRegistryId] = rm.revocationRegistryDefinition));
        const verificationOptions = {
            presentationRequest: options.proofRequest,
            schemas: options.schemas,
            credentialDefinitions: options.credentialDefinitions,
            revocationRegistryDefinitions,
            revocationStatusLists: revocationMetadata.map((rm) => rm.revocationStatusList),
            nonRevokedIntervalOverrides: revocationMetadata
                .filter((rm) => rm.nonRevokedIntervalOverride)
                .map((rm) => rm.nonRevokedIntervalOverride),
        };
        let result = false;
        const presentationJson = core_1.JsonTransformer.toJSON(options.presentation);
        if ('presentation_submission' in presentationJson)
            delete presentationJson.presentation_submission;
        let w3cPresentation;
        try {
            w3cPresentation = anoncreds_shared_1.W3cPresentation.fromJson(presentationJson);
            result = w3cPresentation.verify(verificationOptions);
        }
        finally {
            w3cPresentation === null || w3cPresentation === void 0 ? void 0 : w3cPresentation.handle.clear();
        }
        return result;
    }
};
exports.AnonCredsRsVerifierService = AnonCredsRsVerifierService;
exports.AnonCredsRsVerifierService = AnonCredsRsVerifierService = __decorate([
    (0, core_1.injectable)()
], AnonCredsRsVerifierService);
//# sourceMappingURL=AnonCredsRsVerifierService.js.map