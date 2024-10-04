"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsDataIntegrityService = void 0;
const jsonpath_1 = require("@astronautlabs/jsonpath");
const core_1 = require("@credo-ts/core");
const bn_js_1 = __importDefault(require("bn.js"));
const services_1 = require("../services");
const anonCredsObjects_1 = require("../utils/anonCredsObjects");
const linkSecret_1 = require("../utils/linkSecret");
const w3cAnonCredsUtils_1 = require("../utils/w3cAnonCredsUtils");
const utils_1 = require("./utils");
let AnonCredsDataIntegrityService = class AnonCredsDataIntegrityService {
    constructor() {
        this.createAnonCredsProofRequestAndMetadata = async (agentContext, presentationDefinition, presentationSubmission, credentials, challenge) => {
            var _a, _b, _c;
            const credentialsProve = [];
            const schemaIds = new Set();
            const credentialDefinitionIds = new Set();
            const credentialsWithMetadata = [];
            const hash = core_1.Hasher.hash(core_1.TypedArrayEncoder.fromString(challenge), 'sha-256');
            const nonce = new bn_js_1.default(hash).toString().slice(0, 20);
            const anonCredsProofRequest = {
                version: '1.0',
                name: (_a = presentationDefinition.name) !== null && _a !== void 0 ? _a : 'Proof request',
                nonce,
                requested_attributes: {},
                requested_predicates: {},
            };
            const nonRevoked = Math.floor(Date.now() / 1000);
            const nonRevokedInterval = { from: nonRevoked, to: nonRevoked };
            for (const descriptorMapObject of presentationSubmission.descriptor_map) {
                const descriptor = presentationDefinition.input_descriptors.find((descriptor) => descriptor.id === descriptorMapObject.id);
                if (!descriptor) {
                    throw new Error(`Descriptor with id ${descriptorMapObject.id} not found in presentation definition`);
                }
                const referent = descriptorMapObject.id;
                const attributeReferent = `${referent}_attribute`;
                const predicateReferentBase = `${referent}_predicate`;
                let predicateReferentIndex = 0;
                const fields = (_b = descriptor.constraints) === null || _b === void 0 ? void 0 : _b.fields;
                if (!fields)
                    throw new core_1.CredoError('Unclear mapping of constraint with no fields.');
                const { entryIndex, schemaId, credentialDefinitionId, revocationRegistryId, credential } = await this.getCredentialMetadataForDescriptor(agentContext, descriptorMapObject, credentials);
                schemaIds.add(schemaId);
                credentialDefinitionIds.add(credentialDefinitionId);
                const requiresRevocationStatus = this.descriptorRequiresRevocationStatus(descriptor);
                if (requiresRevocationStatus && !revocationRegistryId) {
                    throw new core_1.CredoError('Selected credentials must be revocable but are not');
                }
                credentialsWithMetadata.push({
                    credential,
                    nonRevoked: requiresRevocationStatus ? nonRevokedInterval : undefined,
                });
                for (const field of fields) {
                    const propertyName = this.getClaimNameForField(field);
                    if (!propertyName)
                        continue;
                    if (field.predicate) {
                        if (!field.filter)
                            throw new core_1.CredoError('Missing required predicate filter property.');
                        const predicateTypeAndValues = this.getPredicateTypeAndValues(field.filter);
                        for (const { predicateType, predicateValue } of predicateTypeAndValues) {
                            const predicateReferent = `${predicateReferentBase}_${predicateReferentIndex++}`;
                            anonCredsProofRequest.requested_predicates[predicateReferent] = {
                                name: propertyName,
                                p_type: predicateType,
                                p_value: predicateValue,
                                restrictions: [{ cred_def_id: credentialDefinitionId }],
                                non_revoked: requiresRevocationStatus ? nonRevokedInterval : undefined,
                            };
                            credentialsProve.push({ entryIndex, referent: predicateReferent, isPredicate: true, reveal: true });
                        }
                    }
                    else {
                        if (!anonCredsProofRequest.requested_attributes[attributeReferent]) {
                            anonCredsProofRequest.requested_attributes[attributeReferent] = {
                                names: [propertyName],
                                restrictions: [{ cred_def_id: credentialDefinitionId }],
                                non_revoked: requiresRevocationStatus ? nonRevokedInterval : undefined,
                            };
                        }
                        else {
                            const names = (_c = anonCredsProofRequest.requested_attributes[attributeReferent].names) !== null && _c !== void 0 ? _c : [];
                            anonCredsProofRequest.requested_attributes[attributeReferent].names = [...names, propertyName];
                        }
                        credentialsProve.push({ entryIndex, referent: attributeReferent, isPredicate: false, reveal: true });
                    }
                }
            }
            return { anonCredsProofRequest, credentialsWithMetadata, credentialsProve, schemaIds, credentialDefinitionIds };
        };
    }
    getDataIntegrityProof(credential) {
        const cryptosuite = core_1.ANONCREDS_DATA_INTEGRITY_CRYPTOSUITE;
        if (Array.isArray(credential.proof)) {
            const proof = credential.proof.find((proof) => proof.type === 'DataIntegrityProof' && 'cryptosuite' in proof && proof.cryptosuite === cryptosuite);
            if (!proof)
                throw new core_1.CredoError(`Could not find ${core_1.ANONCREDS_DATA_INTEGRITY_CRYPTOSUITE} proof`);
            return proof;
        }
        if (credential.proof.type !== 'DataIntegrityProof' ||
            !('cryptosuite' in credential.proof && credential.proof.cryptosuite === cryptosuite)) {
            throw new core_1.CredoError(`Could not find ${core_1.ANONCREDS_DATA_INTEGRITY_CRYPTOSUITE} proof`);
        }
        return credential.proof;
    }
    extractPathNodes(obj, paths) {
        let result = [];
        if (paths) {
            for (const path of paths) {
                result = jsonpath_1.JSONPath.nodes(obj, path);
                if (result.length)
                    break;
            }
        }
        return result;
    }
    async getCredentialMetadataForDescriptor(agentContext, descriptorMapObject, selectedCredentials) {
        const credentialExtractionResult = this.extractPathNodes({ verifiableCredential: selectedCredentials }, [
            descriptorMapObject.path,
        ]);
        if (credentialExtractionResult.length === 0 || credentialExtractionResult.length > 1) {
            throw new Error('Could not extract credential from presentation submission');
        }
        const w3cJsonLdVerifiableCredential = credentialExtractionResult[0].value;
        const w3cJsonLdVerifiableCredentialJson = core_1.JsonTransformer.toJSON(w3cJsonLdVerifiableCredential);
        const entryIndex = selectedCredentials.findIndex((credential) => (0, core_1.deepEquality)(core_1.JsonTransformer.toJSON(credential), w3cJsonLdVerifiableCredentialJson));
        if (entryIndex === -1)
            throw new core_1.CredoError('Could not find selected credential');
        return Object.assign({ entryIndex, credential: selectedCredentials[entryIndex] }, (0, utils_1.getW3cAnonCredsCredentialMetadata)(w3cJsonLdVerifiableCredential));
    }
    descriptorRequiresRevocationStatus(descriptor) {
        var _a, _b;
        const statuses = (_a = descriptor.constraints) === null || _a === void 0 ? void 0 : _a.statuses;
        if (!statuses)
            return false;
        if (((_b = statuses === null || statuses === void 0 ? void 0 : statuses.active) === null || _b === void 0 ? void 0 : _b.directive) &&
            (statuses.active.directive === 'allowed' || statuses.active.directive === 'required')) {
            return true;
        }
        else {
            throw new core_1.CredoError('Unsupported status directive');
        }
    }
    getPredicateTypeAndValues(predicateFilter) {
        const predicates = [];
        const supportedJsonSchemaNumericRangeProperties = {
            exclusiveMinimum: '>',
            exclusiveMaximum: '<',
            minimum: '>=',
            maximum: '<=',
        };
        for (const [key, value] of Object.entries(predicateFilter)) {
            if (key === 'type')
                continue;
            const predicateType = supportedJsonSchemaNumericRangeProperties[key];
            if (!predicateType)
                throw new core_1.CredoError(`Unsupported predicate filter property '${key}'`);
            predicates.push({
                predicateType,
                predicateValue: value,
            });
        }
        return predicates;
    }
    getClaimNameForField(field) {
        if (!field.path)
            throw new core_1.CredoError('Field path is required');
        // fixme: could the path start otherwise?
        const baseClaimPath = '$.credentialSubject.';
        const claimPaths = field.path.filter((path) => path.startsWith(baseClaimPath));
        if (claimPaths.length === 0)
            return undefined;
        // FIXME: we should iterate over all attributes of the schema here and check if the path is valid
        // see https://identity.foundation/presentation-exchange/#presentation-definition
        const claimNames = claimPaths.map((path) => path.slice(baseClaimPath.length));
        const propertyName = claimNames[0];
        return propertyName;
    }
    async createPresentation(agentContext, options) {
        const { presentationDefinition, presentationSubmission, selectedCredentialRecords, challenge } = options;
        const linkSecrets = selectedCredentialRecords
            .map((record) => { var _a; return (_a = (0, w3cAnonCredsUtils_1.getAnonCredsTagsFromRecord)(record)) === null || _a === void 0 ? void 0 : _a.anonCredsLinkSecretId; })
            .filter((linkSecretId) => linkSecretId !== undefined);
        const linkSecretId = (0, linkSecret_1.assertLinkSecretsMatch)(agentContext, linkSecrets);
        const { anonCredsProofRequest, credentialDefinitionIds, schemaIds, credentialsProve, credentialsWithMetadata } = await this.createAnonCredsProofRequestAndMetadata(agentContext, presentationDefinition, presentationSubmission, selectedCredentialRecords.map((record) => record.credential), challenge);
        const createPresentationOptions = {
            linkSecretId,
            proofRequest: anonCredsProofRequest,
            credentialsProve,
            credentialsWithRevocationMetadata: credentialsWithMetadata,
            schemas: await (0, anonCredsObjects_1.fetchSchemas)(agentContext, schemaIds),
            credentialDefinitions: await (0, anonCredsObjects_1.fetchCredentialDefinitions)(agentContext, credentialDefinitionIds),
        };
        const anonCredsHolderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
        const w3cPresentation = await anonCredsHolderService.createW3cPresentation(agentContext, createPresentationOptions);
        return w3cPresentation;
    }
    async verifyPresentation(agentContext, options) {
        const { presentation, presentationDefinition, presentationSubmission, challenge } = options;
        const credentialDefinitionIds = new Set();
        const verifiableCredentials = Array.isArray(presentation.verifiableCredential)
            ? presentation.verifiableCredential
            : [presentation.verifiableCredential];
        for (const verifiableCredential of verifiableCredentials) {
            if (verifiableCredential.claimFormat === core_1.ClaimFormat.LdpVc) {
                const proof = this.getDataIntegrityProof(verifiableCredential);
                credentialDefinitionIds.add(proof.verificationMethod);
            }
            else {
                throw new core_1.CredoError('Unsupported credential type');
            }
        }
        const { anonCredsProofRequest, credentialsWithMetadata } = await this.createAnonCredsProofRequestAndMetadata(agentContext, presentationDefinition, presentationSubmission, verifiableCredentials, challenge);
        const credentialDefinitions = await (0, anonCredsObjects_1.fetchCredentialDefinitions)(agentContext, credentialDefinitionIds);
        const schemaIds = new Set(Object.values(credentialDefinitions).map((cd) => cd.schemaId));
        const schemas = await (0, anonCredsObjects_1.fetchSchemas)(agentContext, schemaIds);
        const anonCredsVerifierService = agentContext.dependencyManager.resolve(services_1.AnonCredsVerifierServiceSymbol);
        return await anonCredsVerifierService.verifyW3cPresentation(agentContext, {
            credentialsWithRevocationMetadata: credentialsWithMetadata,
            presentation,
            proofRequest: anonCredsProofRequest,
            schemas,
            credentialDefinitions,
        });
    }
};
exports.AnonCredsDataIntegrityService = AnonCredsDataIntegrityService;
exports.AnonCredsDataIntegrityService = AnonCredsDataIntegrityService = __decorate([
    (0, core_1.injectable)()
], AnonCredsDataIntegrityService);
//# sourceMappingURL=AnonCredsDataIntegrityService.js.map