"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsProofFormatService = void 0;
const core_1 = require("@credo-ts/core");
const AnonCredsProofRequest_1 = require("../models/AnonCredsProofRequest");
const services_1 = require("../services");
const utils_1 = require("../utils");
const credential_1 = require("../utils/credential");
const getCredentialsForAnonCredsRequest_1 = require("../utils/getCredentialsForAnonCredsRequest");
const ANONCREDS_PRESENTATION_PROPOSAL = 'anoncreds/proof-request@v1.0';
const ANONCREDS_PRESENTATION_REQUEST = 'anoncreds/proof-request@v1.0';
const ANONCREDS_PRESENTATION = 'anoncreds/proof@v1.0';
class AnonCredsProofFormatService {
    constructor() {
        this.formatKey = 'anoncreds';
    }
    async createProposal(agentContext, { attachmentId, proofFormats }) {
        var _a, _b, _c, _d;
        const format = new core_1.ProofFormatSpec({
            format: ANONCREDS_PRESENTATION_PROPOSAL,
            attachmentId,
        });
        const anoncredsFormat = proofFormats.anoncreds;
        if (!anoncredsFormat) {
            throw Error('Missing anoncreds format to create proposal attachment format');
        }
        const proofRequest = (0, utils_1.createRequestFromPreview)({
            attributes: (_a = anoncredsFormat.attributes) !== null && _a !== void 0 ? _a : [],
            predicates: (_b = anoncredsFormat.predicates) !== null && _b !== void 0 ? _b : [],
            name: (_c = anoncredsFormat.name) !== null && _c !== void 0 ? _c : 'Proof request',
            version: (_d = anoncredsFormat.version) !== null && _d !== void 0 ? _d : '1.0',
            nonce: await agentContext.wallet.generateNonce(),
            nonRevokedInterval: anoncredsFormat.nonRevokedInterval,
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
            format: ANONCREDS_PRESENTATION_REQUEST,
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
            format: ANONCREDS_PRESENTATION_REQUEST,
            attachmentId,
        });
        const anoncredsFormat = proofFormats.anoncreds;
        if (!anoncredsFormat) {
            throw Error('Missing anoncreds format in create request attachment format');
        }
        const request = {
            name: anoncredsFormat.name,
            version: anoncredsFormat.version,
            nonce: await agentContext.wallet.generateNonce(),
            requested_attributes: (_a = anoncredsFormat.requested_attributes) !== null && _a !== void 0 ? _a : {},
            requested_predicates: (_b = anoncredsFormat.requested_predicates) !== null && _b !== void 0 ? _b : {},
            non_revoked: anoncredsFormat.non_revoked,
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
            format: ANONCREDS_PRESENTATION,
            attachmentId,
        });
        const requestJson = requestAttachment.getDataAsJson();
        const anoncredsFormat = proofFormats === null || proofFormats === void 0 ? void 0 : proofFormats.anoncreds;
        const selectedCredentials = anoncredsFormat !== null && anoncredsFormat !== void 0 ? anoncredsFormat : (await this._selectCredentialsForRequest(agentContext, requestJson, {
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
        const schemas = await this.getSchemas(agentContext, new Set(proofJson.identifiers.map((i) => i.schema_id)));
        const credentialDefinitions = await this.getCredentialDefinitions(agentContext, new Set(proofJson.identifiers.map((i) => i.cred_def_id)));
        const revocationRegistries = await (0, utils_1.getRevocationRegistriesForProof)(agentContext, proofJson);
        const verified = await verifierService.verifyProof(agentContext, {
            proofRequest: proofRequestJson,
            proof: proofJson,
            schemas,
            credentialDefinitions,
            revocationRegistries,
        });
        return verified;
    }
    async getCredentialsForRequest(agentContext, { requestAttachment, proofFormats }) {
        var _a;
        const proofRequestJson = requestAttachment.getDataAsJson();
        // Set default values
        const { filterByNonRevocationRequirements = true } = (_a = proofFormats === null || proofFormats === void 0 ? void 0 : proofFormats.anoncreds) !== null && _a !== void 0 ? _a : {};
        const credentialsForRequest = await (0, getCredentialsForAnonCredsRequest_1.getCredentialsForAnonCredsProofRequest)(agentContext, proofRequestJson, {
            filterByNonRevocationRequirements,
        });
        return credentialsForRequest;
    }
    async selectCredentialsForRequest(agentContext, { requestAttachment, proofFormats }) {
        var _a;
        const proofRequestJson = requestAttachment.getDataAsJson();
        // Set default values
        const { filterByNonRevocationRequirements = true } = (_a = proofFormats === null || proofFormats === void 0 ? void 0 : proofFormats.anoncreds) !== null && _a !== void 0 ? _a : {};
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
        const supportedFormats = [ANONCREDS_PRESENTATION_PROPOSAL, ANONCREDS_PRESENTATION_REQUEST, ANONCREDS_PRESENTATION];
        return supportedFormats.includes(formatIdentifier);
    }
    async _selectCredentialsForRequest(agentContext, proofRequest, options) {
        const credentialsForRequest = await (0, getCredentialsForAnonCredsRequest_1.getCredentialsForAnonCredsProofRequest)(agentContext, proofRequest, options);
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
            const { schema } = await (0, utils_1.fetchSchema)(agentContext, schemaId);
            schemas[schemaId] = schema;
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
            const { credentialDefinition } = await (0, utils_1.fetchCredentialDefinition)(agentContext, credentialDefinitionId);
            credentialDefinitions[credentialDefinitionId] = credentialDefinition;
        }
        return credentialDefinitions;
    }
    /**
     * Create anoncreds proof from a given proof request and requested credential object.
     *
     * @param proofRequest The proof request to create the proof for
     * @param requestedCredentials The requested credentials object specifying which credentials to use for the proof
     * @returns anoncreds proof object
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
exports.AnonCredsProofFormatService = AnonCredsProofFormatService;
//# sourceMappingURL=AnonCredsProofFormatService.js.map