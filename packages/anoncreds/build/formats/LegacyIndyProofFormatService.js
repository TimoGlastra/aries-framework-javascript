"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyIndyProofFormatService = void 0;
const core_1 = require("@credo-ts/core");
const AnonCredsProofRequest_1 = require("../models/AnonCredsProofRequest");
const services_1 = require("../services");
const utils_1 = require("../utils");
const credential_1 = require("../utils/credential");
const indyIdentifiers_1 = require("../utils/indyIdentifiers");
const timestamp_1 = require("../utils/timestamp");
const V2_INDY_PRESENTATION_PROPOSAL = 'hlindy/proof-req@v2.0';
const V2_INDY_PRESENTATION_REQUEST = 'hlindy/proof-req@v2.0';
const V2_INDY_PRESENTATION = 'hlindy/proof@v2.0';
class LegacyIndyProofFormatService {
    constructor() {
        this.formatKey = 'indy';
    }
    async createProposal(agentContext, { attachmentId, proofFormats }) {
        var _a, _b, _c, _d;
        const format = new core_1.ProofFormatSpec({
            format: V2_INDY_PRESENTATION_PROPOSAL,
            attachmentId,
        });
        const indyFormat = proofFormats.indy;
        if (!indyFormat) {
            throw Error('Missing indy format to create proposal attachment format');
        }
        const proofRequest = (0, utils_1.createRequestFromPreview)({
            attributes: (_a = indyFormat.attributes) !== null && _a !== void 0 ? _a : [],
            predicates: (_b = indyFormat.predicates) !== null && _b !== void 0 ? _b : [],
            name: (_c = indyFormat.name) !== null && _c !== void 0 ? _c : 'Proof request',
            version: (_d = indyFormat.version) !== null && _d !== void 0 ? _d : '1.0',
            nonce: await agentContext.wallet.generateNonce(),
        });
        const attachment = this.getFormatData(proofRequest, format.attachmentId);
        return { attachment, format };
    }
    async processProposal(agentContext, { attachment }) {
        const proposalJson = attachment.getDataAsJson();
        // fromJson also validates
        core_1.JsonTransformer.fromJSON(proposalJson, AnonCredsProofRequest_1.AnonCredsProofRequest);
        // Assert attribute and predicate (group) names do not match
        (0, utils_1.assertNoDuplicateGroupsNamesInProofRequest)(proposalJson);
    }
    async acceptProposal(agentContext, { proposalAttachment, attachmentId }) {
        const format = new core_1.ProofFormatSpec({
            format: V2_INDY_PRESENTATION_REQUEST,
            attachmentId,
        });
        const proposalJson = proposalAttachment.getDataAsJson();
        const request = Object.assign(Object.assign({}, proposalJson), { 
            // We never want to reuse the nonce from the proposal, as this will allow replay attacks
            nonce: await agentContext.wallet.generateNonce() });
        const attachment = this.getFormatData(request, format.attachmentId);
        return { attachment, format };
    }
    async createRequest(agentContext, { attachmentId, proofFormats }) {
        var _a, _b;
        const format = new core_1.ProofFormatSpec({
            format: V2_INDY_PRESENTATION_REQUEST,
            attachmentId,
        });
        const indyFormat = proofFormats.indy;
        if (!indyFormat) {
            throw Error('Missing indy format in create request attachment format');
        }
        const request = {
            name: indyFormat.name,
            version: indyFormat.version,
            nonce: await agentContext.wallet.generateNonce(),
            requested_attributes: (_a = indyFormat.requested_attributes) !== null && _a !== void 0 ? _a : {},
            requested_predicates: (_b = indyFormat.requested_predicates) !== null && _b !== void 0 ? _b : {},
            non_revoked: indyFormat.non_revoked,
        };
        // Assert attribute and predicate (group) names do not match
        (0, utils_1.assertNoDuplicateGroupsNamesInProofRequest)(request);
        const attachment = this.getFormatData(request, format.attachmentId);
        return { attachment, format };
    }
    async processRequest(agentContext, { attachment }) {
        const requestJson = attachment.getDataAsJson();
        // fromJson also validates
        core_1.JsonTransformer.fromJSON(requestJson, AnonCredsProofRequest_1.AnonCredsProofRequest);
        // Assert attribute and predicate (group) names do not match
        (0, utils_1.assertNoDuplicateGroupsNamesInProofRequest)(requestJson);
    }
    async acceptRequest(agentContext, { proofFormats, requestAttachment, attachmentId }) {
        const format = new core_1.ProofFormatSpec({
            format: V2_INDY_PRESENTATION,
            attachmentId,
        });
        const requestJson = requestAttachment.getDataAsJson();
        const indyFormat = proofFormats === null || proofFormats === void 0 ? void 0 : proofFormats.indy;
        const selectedCredentials = indyFormat !== null && indyFormat !== void 0 ? indyFormat : (await this._selectCredentialsForRequest(agentContext, requestJson, {
            filterByNonRevocationRequirements: true,
        }));
        const proof = await this.createProof(agentContext, requestJson, selectedCredentials);
        const attachment = this.getFormatData(proof, format.attachmentId);
        return {
            attachment,
            format,
        };
    }
    async processPresentation(agentContext, { requestAttachment, attachment }) {
        var _a;
        const verifierService = agentContext.dependencyManager.resolve(services_1.AnonCredsVerifierServiceSymbol);
        const proofRequestJson = requestAttachment.getDataAsJson();
        // NOTE: we don't do validation here, as this is handled by the AnonCreds implementation, however
        // this can lead to confusing error messages. We should consider doing validation here as well.
        // Defining a class-transformer/class-validator class seems a bit overkill, and the usage of interfaces
        // for the anoncreds package keeps things simple. Maybe we can try to use something like zod to validate
        const proofJson = attachment.getDataAsJson();
        for (const [referent, attribute] of Object.entries(proofJson.requested_proof.revealed_attrs)) {
            if (!(0, utils_1.checkValidCredentialValueEncoding)(attribute.raw, attribute.encoded)) {
                throw new core_1.CredoError(`The encoded value for '${referent}' is invalid. ` +
                    `Expected '${(0, credential_1.encodeCredentialValue)(attribute.raw)}'. ` +
                    `Actual '${attribute.encoded}'`);
            }
        }
        for (const [, attributeGroup] of Object.entries((_a = proofJson.requested_proof.revealed_attr_groups) !== null && _a !== void 0 ? _a : {})) {
            for (const [attributeName, attribute] of Object.entries(attributeGroup.values)) {
                if (!(0, utils_1.checkValidCredentialValueEncoding)(attribute.raw, attribute.encoded)) {
                    throw new core_1.CredoError(`The encoded value for '${attributeName}' is invalid. ` +
                        `Expected '${(0, credential_1.encodeCredentialValue)(attribute.raw)}'. ` +
                        `Actual '${attribute.encoded}'`);
                }
            }
        }
        // TODO: pre verify proof json
        // I'm not 100% sure how much indy does. Also if it checks whether the proof requests matches the proof
        // @see https://github.com/hyperledger/aries-cloudagent-python/blob/master/aries_cloudagent/indy/sdk/verifier.py#L79-L164
        const schemas = await this.getSchemas(agentContext, new Set(proofJson.identifiers.map((i) => i.schema_id)));
        const credentialDefinitions = await this.getCredentialDefinitions(agentContext, new Set(proofJson.identifiers.map((i) => i.cred_def_id)));
        const revocationRegistries = await (0, utils_1.getRevocationRegistriesForProof)(agentContext, proofJson);
        return await verifierService.verifyProof(agentContext, {
            proofRequest: proofRequestJson,
            proof: proofJson,
            schemas,
            credentialDefinitions,
            revocationRegistries,
        });
    }
    async getCredentialsForRequest(agentContext, { requestAttachment, proofFormats }) {
        var _a;
        const proofRequestJson = requestAttachment.getDataAsJson();
        // Set default values
        const { filterByNonRevocationRequirements = true } = (_a = proofFormats === null || proofFormats === void 0 ? void 0 : proofFormats.indy) !== null && _a !== void 0 ? _a : {};
        const credentialsForRequest = await this._getCredentialsForRequest(agentContext, proofRequestJson, {
            filterByNonRevocationRequirements,
        });
        return credentialsForRequest;
    }
    async selectCredentialsForRequest(agentContext, { requestAttachment, proofFormats }) {
        var _a;
        const proofRequestJson = requestAttachment.getDataAsJson();
        // Set default values
        const { filterByNonRevocationRequirements = true } = (_a = proofFormats === null || proofFormats === void 0 ? void 0 : proofFormats.indy) !== null && _a !== void 0 ? _a : {};
        const selectedCredentials = this._selectCredentialsForRequest(agentContext, proofRequestJson, {
            filterByNonRevocationRequirements,
        });
        return selectedCredentials;
    }
    async shouldAutoRespondToProposal(agentContext, { proposalAttachment, requestAttachment }) {
        const proposalJson = proposalAttachment.getDataAsJson();
        const requestJson = requestAttachment.getDataAsJson();
        const areRequestsEqual = (0, utils_1.areAnonCredsProofRequestsEqual)(proposalJson, requestJson);
        agentContext.config.logger.debug(`AnonCreds request and proposal are are equal: ${areRequestsEqual}`, {
            proposalJson,
            requestJson,
        });
        return areRequestsEqual;
    }
    async shouldAutoRespondToRequest(agentContext, { proposalAttachment, requestAttachment }) {
        const proposalJson = proposalAttachment.getDataAsJson();
        const requestJson = requestAttachment.getDataAsJson();
        return (0, utils_1.areAnonCredsProofRequestsEqual)(proposalJson, requestJson);
    }
    async shouldAutoRespondToPresentation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _agentContext, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options) {
        // The presentation is already verified in processPresentation, so we can just return true here.
        // It's only an ack, so it's just that we received the presentation.
        return true;
    }
    supportsFormat(formatIdentifier) {
        const supportedFormats = [V2_INDY_PRESENTATION_PROPOSAL, V2_INDY_PRESENTATION_REQUEST, V2_INDY_PRESENTATION];
        return supportedFormats.includes(formatIdentifier);
    }
    async _getCredentialsForRequest(agentContext, proofRequest, options) {
        const credentialsForProofRequest = {
            attributes: {},
            predicates: {},
        };
        for (const [referent, requestedAttribute] of Object.entries(proofRequest.requested_attributes)) {
            const credentials = await this.getCredentialsForProofRequestReferent(agentContext, proofRequest, referent);
            credentialsForProofRequest.attributes[referent] = (0, utils_1.sortRequestedCredentialsMatches)(await Promise.all(credentials.map(async (credential) => {
                const { isRevoked, timestamp } = await this.getRevocationStatus(agentContext, proofRequest, requestedAttribute, credential.credentialInfo);
                return {
                    credentialId: credential.credentialInfo.credentialId,
                    revealed: true,
                    credentialInfo: credential.credentialInfo,
                    timestamp,
                    revoked: isRevoked,
                };
            })));
            // We only attach revoked state if non-revocation is requested. So if revoked is true it means
            // the credential is not applicable to the proof request
            if (options.filterByNonRevocationRequirements) {
                credentialsForProofRequest.attributes[referent] = credentialsForProofRequest.attributes[referent].filter((r) => !r.revoked);
            }
        }
        for (const [referent, requestedPredicate] of Object.entries(proofRequest.requested_predicates)) {
            const credentials = await this.getCredentialsForProofRequestReferent(agentContext, proofRequest, referent);
            credentialsForProofRequest.predicates[referent] = (0, utils_1.sortRequestedCredentialsMatches)(await Promise.all(credentials.map(async (credential) => {
                const { isRevoked, timestamp } = await this.getRevocationStatus(agentContext, proofRequest, requestedPredicate, credential.credentialInfo);
                return {
                    credentialId: credential.credentialInfo.credentialId,
                    credentialInfo: credential.credentialInfo,
                    timestamp,
                    revoked: isRevoked,
                };
            })));
            // We only attach revoked state if non-revocation is requested. So if revoked is true it means
            // the credential is not applicable to the proof request
            if (options.filterByNonRevocationRequirements) {
                credentialsForProofRequest.predicates[referent] = credentialsForProofRequest.predicates[referent].filter((r) => !r.revoked);
            }
        }
        return credentialsForProofRequest;
    }
    async _selectCredentialsForRequest(agentContext, proofRequest, options) {
        const credentialsForRequest = await this._getCredentialsForRequest(agentContext, proofRequest, options);
        const selectedCredentials = {
            attributes: {},
            predicates: {},
            selfAttestedAttributes: {},
        };
        Object.keys(credentialsForRequest.attributes).forEach((attributeName) => {
            const attributeArray = credentialsForRequest.attributes[attributeName];
            if (attributeArray.length === 0) {
                throw new core_1.CredoError('Unable to automatically select requested attributes.');
            }
            selectedCredentials.attributes[attributeName] = attributeArray[0];
        });
        Object.keys(credentialsForRequest.predicates).forEach((attributeName) => {
            if (credentialsForRequest.predicates[attributeName].length === 0) {
                throw new core_1.CredoError('Unable to automatically select requested predicates.');
            }
            else {
                selectedCredentials.predicates[attributeName] = credentialsForRequest.predicates[attributeName][0];
            }
        });
        return selectedCredentials;
    }
    async getCredentialsForProofRequestReferent(agentContext, proofRequest, attributeReferent) {
        const holderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
        const credentials = await holderService.getCredentialsForProofRequest(agentContext, {
            proofRequest,
            attributeReferent,
        });
        return credentials;
    }
    /**
     * Build schemas object needed to create and verify proof objects.
     *
     * Creates object with `{ schemaId: AnonCredsSchema }` mapping
     *
     * @param schemaIds List of schema ids
     * @returns Object containing schemas for specified schema ids
     *
     */
    async getSchemas(agentContext, schemaIds) {
        const schemas = {};
        for (const schemaId of schemaIds) {
            const schemaResult = await (0, utils_1.fetchSchema)(agentContext, schemaId);
            if ((0, indyIdentifiers_1.isUnqualifiedSchemaId)(schemaResult.schemaId)) {
                schemas[schemaId] = schemaResult.schema;
            }
            else {
                schemas[(0, indyIdentifiers_1.getUnQualifiedDidIndyDid)(schemaId)] = (0, indyIdentifiers_1.getUnqualifiedDidIndySchema)(schemaResult.schema);
            }
        }
        return schemas;
    }
    /**
     * Build credential definitions object needed to create and verify proof objects.
     *
     * Creates object with `{ credentialDefinitionId: AnonCredsCredentialDefinition }` mapping
     *
     * @param credentialDefinitionIds List of credential definition ids
     * @returns Object containing credential definitions for specified credential definition ids
     *
     */
    async getCredentialDefinitions(agentContext, credentialDefinitionIds) {
        const credentialDefinitions = {};
        for (const credentialDefinitionId of credentialDefinitionIds) {
            const credentialDefinitionResult = await (0, utils_1.fetchCredentialDefinition)(agentContext, credentialDefinitionId);
            if ((0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(credentialDefinitionResult.credentialDefinitionId)) {
                credentialDefinitions[credentialDefinitionId] = credentialDefinitionResult.credentialDefinition;
            }
            else {
                credentialDefinitions[(0, indyIdentifiers_1.getUnQualifiedDidIndyDid)(credentialDefinitionId)] =
                    (0, indyIdentifiers_1.getUnqualifiedDidIndyCredentialDefinition)(credentialDefinitionResult.credentialDefinition);
            }
        }
        return credentialDefinitions;
    }
    async getRevocationStatus(agentContext, proofRequest, requestedItem, credentialInfo) {
        var _a, _b;
        const requestNonRevoked = (_a = requestedItem.non_revoked) !== null && _a !== void 0 ? _a : proofRequest.non_revoked;
        const credentialRevocationId = credentialInfo.credentialRevocationId;
        const revocationRegistryId = credentialInfo.revocationRegistryId;
        // If revocation interval is not present or the credential is not revocable then we
        // don't need to fetch the revocation status
        if (!requestNonRevoked || credentialRevocationId === null || !revocationRegistryId) {
            return { isRevoked: undefined, timestamp: undefined };
        }
        agentContext.config.logger.trace(`Fetching credential revocation status for credential revocation id '${credentialRevocationId}' with revocation interval with from '${requestNonRevoked.from}' and to '${requestNonRevoked.to}'`);
        // Make sure the revocation interval follows best practices from Aries RFC 0441
        (0, utils_1.assertBestPracticeRevocationInterval)(requestNonRevoked);
        const { revocationStatusList } = await (0, utils_1.fetchRevocationStatusList)(agentContext, revocationRegistryId, (_b = requestNonRevoked.to) !== null && _b !== void 0 ? _b : (0, timestamp_1.dateToTimestamp)(new Date()));
        // Item is revoked when the value at the index is 1
        const isRevoked = revocationStatusList.revocationList[parseInt(credentialRevocationId)] === 1;
        agentContext.config.logger.trace(`Credential with credential revocation index '${credentialRevocationId}' is ${isRevoked ? '' : 'not '}revoked with revocation interval with to '${requestNonRevoked.to}' & from '${requestNonRevoked.from}'`);
        return {
            isRevoked,
            timestamp: revocationStatusList.timestamp,
        };
    }
    /**
     * Create indy proof from a given proof request and requested credential object.
     *
     * @param proofRequest The proof request to create the proof for
     * @param requestedCredentials The requested credentials object specifying which credentials to use for the proof
     * @returns indy proof object
     */
    async createProof(agentContext, proofRequest, selectedCredentials) {
        const holderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
        const credentialObjects = await Promise.all([...Object.values(selectedCredentials.attributes), ...Object.values(selectedCredentials.predicates)].map(async (c) => { var _a; return (_a = c.credentialInfo) !== null && _a !== void 0 ? _a : holderService.getCredential(agentContext, { id: c.credentialId }); }));
        const schemas = await this.getSchemas(agentContext, new Set(credentialObjects.map((c) => c.schemaId)));
        const credentialDefinitions = await this.getCredentialDefinitions(agentContext, new Set(credentialObjects.map((c) => c.credentialDefinitionId)));
        // selectedCredentials are overridden with specified timestamps of the revocation status list that
        // should be used for the selected credentials.
        const { revocationRegistries, updatedSelectedCredentials } = await (0, utils_1.getRevocationRegistriesForRequest)(agentContext, proofRequest, selectedCredentials);
        return await holderService.createProof(agentContext, {
            proofRequest,
            selectedCredentials: updatedSelectedCredentials,
            schemas,
            credentialDefinitions,
            revocationRegistries,
        });
    }
    /**
     * Returns an object of type {@link Attachment} for use in credential exchange messages.
     * It looks up the correct format identifier and encodes the data as a base64 attachment.
     *
     * @param data The data to include in the attach object
     * @param id the attach id from the formats component of the message
     */
    getFormatData(data, id) {
        const attachment = new core_1.Attachment({
            id,
            mimeType: 'application/json',
            data: new core_1.AttachmentData({
                base64: core_1.JsonEncoder.toBase64(data),
            }),
        });
        return attachment;
    }
}
exports.LegacyIndyProofFormatService = LegacyIndyProofFormatService;
//# sourceMappingURL=LegacyIndyProofFormatService.js.map