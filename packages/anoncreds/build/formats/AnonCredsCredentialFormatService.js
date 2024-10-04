"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsCredentialFormatService = void 0;
const core_1 = require("@credo-ts/core");
const AnonCredsCredentialProposal_1 = require("../models/AnonCredsCredentialProposal");
const repository_1 = require("../repository");
const services_1 = require("../services");
const utils_1 = require("../utils");
const credential_1 = require("../utils/credential");
const metadata_1 = require("../utils/metadata");
const w3cAnonCredsUtils_1 = require("../utils/w3cAnonCredsUtils");
const ANONCREDS_CREDENTIAL_OFFER = 'anoncreds/credential-offer@v1.0';
const ANONCREDS_CREDENTIAL_REQUEST = 'anoncreds/credential-request@v1.0';
const ANONCREDS_CREDENTIAL_FILTER = 'anoncreds/credential-filter@v1.0';
const ANONCREDS_CREDENTIAL = 'anoncreds/credential@v1.0';
class AnonCredsCredentialFormatService {
    constructor() {
        /** formatKey is the key used when calling agent.credentials.xxx with credentialFormats.anoncreds */
        this.formatKey = 'anoncreds';
        /**
         * credentialRecordType is the type of record that stores the credential. It is stored in the credential
         * record binding in the credential exchange record.
         */
        this.credentialRecordType = 'w3c';
    }
    /**
     * Create a {@link AttachmentFormats} object dependent on the message type.
     *
     * @param options The object containing all the options for the proposed credential
     * @returns object containing associated attachment, format and optionally the credential preview
     *
     */
    async createProposal(agentContext, { credentialFormats, credentialRecord }) {
        const format = new core_1.CredentialFormatSpec({
            format: ANONCREDS_CREDENTIAL_FILTER,
        });
        const anoncredsFormat = credentialFormats.anoncreds;
        if (!anoncredsFormat) {
            throw new core_1.CredoError('Missing anoncreds payload in createProposal');
        }
        // We want all properties except for `attributes` and `linkedAttachments` attributes.
        // The easiest way is to destructure and use the spread operator. But that leaves the other properties unused
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { attributes, linkedAttachments } = anoncredsFormat, anoncredsCredentialProposal = __rest(anoncredsFormat, ["attributes", "linkedAttachments"]);
        const proposal = new AnonCredsCredentialProposal_1.AnonCredsCredentialProposal(anoncredsCredentialProposal);
        try {
            core_1.MessageValidator.validateSync(proposal);
        }
        catch (error) {
            throw new core_1.CredoError(`Invalid proposal supplied: ${anoncredsCredentialProposal} in AnonCredsFormatService`);
        }
        const attachment = this.getFormatData(core_1.JsonTransformer.toJSON(proposal), format.attachmentId);
        const { previewAttributes } = this.getCredentialLinkedAttachments(anoncredsFormat.attributes, anoncredsFormat.linkedAttachments);
        // Set the metadata
        credentialRecord.metadata.set(metadata_1.AnonCredsCredentialMetadataKey, {
            schemaId: proposal.schemaId,
            credentialDefinitionId: proposal.credentialDefinitionId,
        });
        return { format, attachment, previewAttributes };
    }
    async processProposal(agentContext, { attachment }) {
        const proposalJson = attachment.getDataAsJson();
        core_1.JsonTransformer.fromJSON(proposalJson, AnonCredsCredentialProposal_1.AnonCredsCredentialProposal);
    }
    async acceptProposal(agentContext, { attachmentId, credentialFormats, credentialRecord, proposalAttachment, }) {
        var _a, _b;
        const anoncredsFormat = credentialFormats === null || credentialFormats === void 0 ? void 0 : credentialFormats.anoncreds;
        const proposalJson = proposalAttachment.getDataAsJson();
        const credentialDefinitionId = (_a = anoncredsFormat === null || anoncredsFormat === void 0 ? void 0 : anoncredsFormat.credentialDefinitionId) !== null && _a !== void 0 ? _a : proposalJson.cred_def_id;
        const attributes = (_b = anoncredsFormat === null || anoncredsFormat === void 0 ? void 0 : anoncredsFormat.attributes) !== null && _b !== void 0 ? _b : credentialRecord.credentialAttributes;
        if (!credentialDefinitionId) {
            throw new core_1.CredoError('No credential definition id in proposal or provided as input to accept proposal method.');
        }
        if (!attributes) {
            throw new core_1.CredoError('No attributes in proposal or provided as input to accept proposal method.');
        }
        const { format, attachment, previewAttributes } = await this.createAnonCredsOffer(agentContext, {
            credentialRecord,
            attachmentId,
            attributes,
            credentialDefinitionId,
            revocationRegistryDefinitionId: anoncredsFormat === null || anoncredsFormat === void 0 ? void 0 : anoncredsFormat.revocationRegistryDefinitionId,
            revocationRegistryIndex: anoncredsFormat === null || anoncredsFormat === void 0 ? void 0 : anoncredsFormat.revocationRegistryIndex,
            linkedAttachments: anoncredsFormat === null || anoncredsFormat === void 0 ? void 0 : anoncredsFormat.linkedAttachments,
        });
        return { format, attachment, previewAttributes };
    }
    /**
     * Create a credential attachment format for a credential request.
     *
     * @param options The object containing all the options for the credential offer
     * @returns object containing associated attachment, formats and offersAttach elements
     *
     */
    async createOffer(agentContext, { credentialFormats, credentialRecord, attachmentId }) {
        const anoncredsFormat = credentialFormats.anoncreds;
        if (!anoncredsFormat) {
            throw new core_1.CredoError('Missing anoncreds credential format data');
        }
        const { format, attachment, previewAttributes } = await this.createAnonCredsOffer(agentContext, {
            credentialRecord,
            attachmentId,
            attributes: anoncredsFormat.attributes,
            credentialDefinitionId: anoncredsFormat.credentialDefinitionId,
            revocationRegistryDefinitionId: anoncredsFormat.revocationRegistryDefinitionId,
            revocationRegistryIndex: anoncredsFormat.revocationRegistryIndex,
            linkedAttachments: anoncredsFormat.linkedAttachments,
        });
        return { format, attachment, previewAttributes };
    }
    async processOffer(agentContext, { attachment, credentialRecord }) {
        agentContext.config.logger.debug(`Processing anoncreds credential offer for credential record ${credentialRecord.id}`);
        const credOffer = attachment.getDataAsJson();
        if (!credOffer.schema_id || !credOffer.cred_def_id) {
            throw new core_1.ProblemReportError('Invalid credential offer', {
                problemCode: core_1.CredentialProblemReportReason.IssuanceAbandoned,
            });
        }
    }
    async acceptOffer(agentContext, { credentialRecord, attachmentId, offerAttachment, credentialFormats, }) {
        var _a;
        const holderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
        const credentialOffer = offerAttachment.getDataAsJson();
        // Get credential definition
        const { credentialDefinition } = await (0, utils_1.fetchCredentialDefinition)(agentContext, credentialOffer.cred_def_id);
        const { credentialRequest, credentialRequestMetadata } = await holderService.createCredentialRequest(agentContext, {
            credentialOffer,
            credentialDefinition,
            linkSecretId: (_a = credentialFormats === null || credentialFormats === void 0 ? void 0 : credentialFormats.anoncreds) === null || _a === void 0 ? void 0 : _a.linkSecretId,
        });
        credentialRecord.metadata.set(metadata_1.AnonCredsCredentialRequestMetadataKey, credentialRequestMetadata);
        credentialRecord.metadata.set(metadata_1.AnonCredsCredentialMetadataKey, {
            credentialDefinitionId: credentialOffer.cred_def_id,
            schemaId: credentialOffer.schema_id,
        });
        const format = new core_1.CredentialFormatSpec({
            attachmentId,
            format: ANONCREDS_CREDENTIAL_REQUEST,
        });
        const attachment = this.getFormatData(credentialRequest, format.attachmentId);
        return { format, attachment };
    }
    /**
     * Starting from a request is not supported for anoncreds credentials, this method only throws an error.
     */
    async createRequest() {
        throw new core_1.CredoError('Starting from a request is not supported for anoncreds credentials');
    }
    /**
     * We don't have any models to validate an anoncreds request object, for now this method does nothing
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async processRequest(agentContext, options) {
        // not needed for anoncreds
    }
    async acceptRequest(agentContext, { credentialRecord, attachmentId, offerAttachment, requestAttachment, }) {
        // Assert credential attributes
        const credentialAttributes = credentialRecord.credentialAttributes;
        if (!credentialAttributes) {
            throw new core_1.CredoError(`Missing required credential attribute values on credential record with id ${credentialRecord.id}`);
        }
        const anonCredsIssuerService = agentContext.dependencyManager.resolve(services_1.AnonCredsIssuerServiceSymbol);
        const credentialOffer = offerAttachment === null || offerAttachment === void 0 ? void 0 : offerAttachment.getDataAsJson();
        if (!credentialOffer)
            throw new core_1.CredoError('Missing anoncreds credential offer in createCredential');
        const credentialRequest = requestAttachment.getDataAsJson();
        if (!credentialRequest)
            throw new core_1.CredoError('Missing anoncreds credential request in createCredential');
        // We check locally for credential definition info. If it supports revocation, we need to search locally for
        // an active revocation registry
        const credentialDefinition = (await agentContext.dependencyManager
            .resolve(repository_1.AnonCredsCredentialDefinitionRepository)
            .getByCredentialDefinitionId(agentContext, credentialRequest.cred_def_id)).credentialDefinition.value;
        let revocationRegistryDefinitionId;
        let revocationRegistryIndex;
        let revocationStatusList;
        if (credentialDefinition.revocation) {
            const credentialMetadata = credentialRecord.metadata.get(metadata_1.AnonCredsCredentialMetadataKey);
            revocationRegistryDefinitionId = credentialMetadata === null || credentialMetadata === void 0 ? void 0 : credentialMetadata.revocationRegistryId;
            if (credentialMetadata === null || credentialMetadata === void 0 ? void 0 : credentialMetadata.credentialRevocationId) {
                revocationRegistryIndex = Number(credentialMetadata.credentialRevocationId);
            }
            if (!revocationRegistryDefinitionId || revocationRegistryIndex === undefined) {
                throw new core_1.CredoError('Revocation registry definition id and revocation index are mandatory to issue AnonCreds revocable credentials');
            }
            const revocationRegistryDefinitionPrivateRecord = await agentContext.dependencyManager
                .resolve(repository_1.AnonCredsRevocationRegistryDefinitionPrivateRepository)
                .getByRevocationRegistryDefinitionId(agentContext, revocationRegistryDefinitionId);
            if (revocationRegistryDefinitionPrivateRecord.state !== repository_1.AnonCredsRevocationRegistryState.Active) {
                throw new core_1.CredoError(`Revocation registry ${revocationRegistryDefinitionId} is in ${revocationRegistryDefinitionPrivateRecord.state} state`);
            }
            const revocationStatusListResult = await (0, utils_1.fetchRevocationStatusList)(agentContext, revocationRegistryDefinitionId, (0, utils_1.dateToTimestamp)(new Date()));
            revocationStatusList = revocationStatusListResult.revocationStatusList;
        }
        const { credential, credentialRevocationId } = await anonCredsIssuerService.createCredential(agentContext, {
            credentialOffer,
            credentialRequest,
            credentialValues: (0, credential_1.convertAttributesToCredentialValues)(credentialAttributes),
            revocationRegistryDefinitionId,
            revocationRegistryIndex,
            revocationStatusList,
        });
        // If the credential is revocable, store the revocation identifiers in the credential record
        if (credential.rev_reg_id) {
            credentialRecord.metadata.add(metadata_1.AnonCredsCredentialMetadataKey, {
                revocationRegistryId: revocationRegistryDefinitionId !== null && revocationRegistryDefinitionId !== void 0 ? revocationRegistryDefinitionId : undefined,
                credentialRevocationId: credentialRevocationId !== null && credentialRevocationId !== void 0 ? credentialRevocationId : undefined,
            });
            credentialRecord.setTags({
                anonCredsRevocationRegistryId: revocationRegistryDefinitionId,
                anonCredsCredentialRevocationId: credentialRevocationId,
            });
        }
        const format = new core_1.CredentialFormatSpec({
            attachmentId,
            format: ANONCREDS_CREDENTIAL,
        });
        const attachment = this.getFormatData(credential, format.attachmentId);
        return { format, attachment };
    }
    /**
     * Processes an incoming credential - retrieve metadata, retrieve payload and store it in wallet
     * @param options the issue credential message wrapped inside this object
     * @param credentialRecord the credential exchange record for this credential
     */
    async processCredential(agentContext, { credentialRecord, attachment }) {
        var _a, _b;
        const credentialRequestMetadata = credentialRecord.metadata.get(metadata_1.AnonCredsCredentialRequestMetadataKey);
        const anonCredsHolderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
        if (!credentialRequestMetadata) {
            throw new core_1.CredoError(`Missing required request metadata for credential exchange with thread id with id ${credentialRecord.id}`);
        }
        if (!credentialRecord.credentialAttributes) {
            throw new core_1.CredoError('Missing credential attributes on credential record. Unable to check credential attributes');
        }
        const anonCredsCredential = attachment.getDataAsJson();
        const { credentialDefinition, credentialDefinitionId } = await (0, utils_1.fetchCredentialDefinition)(agentContext, anonCredsCredential.cred_def_id);
        const { schema, indyNamespace } = await (0, utils_1.fetchSchema)(agentContext, anonCredsCredential.schema_id);
        // Resolve revocation registry if credential is revocable
        const revocationRegistryResult = anonCredsCredential.rev_reg_id
            ? await (0, utils_1.fetchRevocationRegistryDefinition)(agentContext, anonCredsCredential.rev_reg_id)
            : undefined;
        // assert the credential values match the offer values
        const recordCredentialValues = (0, credential_1.convertAttributesToCredentialValues)(credentialRecord.credentialAttributes);
        (0, credential_1.assertCredentialValuesMatch)(anonCredsCredential.values, recordCredentialValues);
        const storeCredentialOptions = (0, w3cAnonCredsUtils_1.getStoreCredentialOptions)({
            credentialId: core_1.utils.uuid(),
            credentialRequestMetadata,
            credential: anonCredsCredential,
            credentialDefinitionId,
            credentialDefinition,
            schema,
            revocationRegistry: (revocationRegistryResult === null || revocationRegistryResult === void 0 ? void 0 : revocationRegistryResult.revocationRegistryDefinition)
                ? {
                    definition: revocationRegistryResult.revocationRegistryDefinition,
                    id: revocationRegistryResult.revocationRegistryDefinitionId,
                }
                : undefined,
        }, indyNamespace);
        const credentialId = await anonCredsHolderService.storeCredential(agentContext, storeCredentialOptions);
        // If the credential is revocable, store the revocation identifiers in the credential record
        if (anonCredsCredential.rev_reg_id) {
            const credential = await anonCredsHolderService.getCredential(agentContext, { id: credentialId });
            credentialRecord.metadata.add(metadata_1.AnonCredsCredentialMetadataKey, {
                credentialRevocationId: (_a = credential.credentialRevocationId) !== null && _a !== void 0 ? _a : undefined,
                revocationRegistryId: (_b = credential.revocationRegistryId) !== null && _b !== void 0 ? _b : undefined,
            });
            credentialRecord.setTags({
                anonCredsRevocationRegistryId: credential.revocationRegistryId,
                anonCredsCredentialRevocationId: credential.credentialRevocationId,
            });
        }
        credentialRecord.credentials.push({
            credentialRecordType: this.credentialRecordType,
            credentialRecordId: credentialId,
        });
    }
    supportsFormat(format) {
        const supportedFormats = [
            ANONCREDS_CREDENTIAL_REQUEST,
            ANONCREDS_CREDENTIAL_OFFER,
            ANONCREDS_CREDENTIAL_FILTER,
            ANONCREDS_CREDENTIAL,
        ];
        return supportedFormats.includes(format);
    }
    /**
     * Gets the attachment object for a given attachmentId. We need to get out the correct attachmentId for
     * anoncreds and then find the corresponding attachment (if there is one)
     * @param formats the formats object containing the attachmentId
     * @param messageAttachments the attachments containing the payload
     * @returns The Attachment if found or undefined
     *
     */
    getAttachment(formats, messageAttachments) {
        const supportedAttachmentIds = formats.filter((f) => this.supportsFormat(f.format)).map((f) => f.attachmentId);
        const supportedAttachment = messageAttachments.find((attachment) => supportedAttachmentIds.includes(attachment.id));
        return supportedAttachment;
    }
    async deleteCredentialById(agentContext, credentialRecordId) {
        const anonCredsHolderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
        await anonCredsHolderService.deleteCredential(agentContext, credentialRecordId);
    }
    async shouldAutoRespondToProposal(agentContext, { offerAttachment, proposalAttachment }) {
        const proposalJson = proposalAttachment.getDataAsJson();
        const offerJson = offerAttachment.getDataAsJson();
        // We want to make sure the credential definition matches.
        // TODO: If no credential definition is present on the proposal, we could check whether the other fields
        // of the proposal match with the credential definition id.
        return proposalJson.cred_def_id === offerJson.cred_def_id;
    }
    async shouldAutoRespondToOffer(agentContext, { offerAttachment, proposalAttachment }) {
        const proposalJson = proposalAttachment.getDataAsJson();
        const offerJson = offerAttachment.getDataAsJson();
        // We want to make sure the credential definition matches.
        // TODO: If no credential definition is present on the proposal, we could check whether the other fields
        // of the proposal match with the credential definition id.
        return proposalJson.cred_def_id === offerJson.cred_def_id;
    }
    async shouldAutoRespondToRequest(agentContext, { offerAttachment, requestAttachment }) {
        const credentialOfferJson = offerAttachment.getDataAsJson();
        const credentialRequestJson = requestAttachment.getDataAsJson();
        return credentialOfferJson.cred_def_id === credentialRequestJson.cred_def_id;
    }
    async shouldAutoRespondToCredential(agentContext, { credentialRecord, requestAttachment, credentialAttachment }) {
        const credentialJson = credentialAttachment.getDataAsJson();
        const credentialRequestJson = requestAttachment.getDataAsJson();
        // make sure the credential definition matches
        if (credentialJson.cred_def_id !== credentialRequestJson.cred_def_id)
            return false;
        // If we don't have any attributes stored we can't compare so always return false.
        if (!credentialRecord.credentialAttributes)
            return false;
        const attributeValues = (0, credential_1.convertAttributesToCredentialValues)(credentialRecord.credentialAttributes);
        // check whether the values match the values in the record
        return (0, credential_1.checkCredentialValuesMatch)(attributeValues, credentialJson.values);
    }
    async createAnonCredsOffer(agentContext, { credentialRecord, attachmentId, credentialDefinitionId, revocationRegistryDefinitionId, revocationRegistryIndex, attributes, linkedAttachments, }) {
        const anonCredsIssuerService = agentContext.dependencyManager.resolve(services_1.AnonCredsIssuerServiceSymbol);
        // if the proposal has an attachment Id use that, otherwise the generated id of the formats object
        const format = new core_1.CredentialFormatSpec({
            attachmentId: attachmentId,
            format: ANONCREDS_CREDENTIAL,
        });
        const offer = await anonCredsIssuerService.createCredentialOffer(agentContext, {
            credentialDefinitionId,
        });
        const { previewAttributes } = this.getCredentialLinkedAttachments(attributes, linkedAttachments);
        if (!previewAttributes) {
            throw new core_1.CredoError('Missing required preview attributes for anoncreds offer');
        }
        await this.assertPreviewAttributesMatchSchemaAttributes(agentContext, offer, previewAttributes);
        // We check locally for credential definition info. If it supports revocation, revocationRegistryIndex
        // and revocationRegistryDefinitionId are mandatory
        const credentialDefinition = (await agentContext.dependencyManager
            .resolve(repository_1.AnonCredsCredentialDefinitionRepository)
            .getByCredentialDefinitionId(agentContext, offer.cred_def_id)).credentialDefinition.value;
        if (credentialDefinition.revocation) {
            if (!revocationRegistryDefinitionId || revocationRegistryIndex === undefined) {
                throw new core_1.CredoError('AnonCreds revocable credentials require revocationRegistryDefinitionId and revocationRegistryIndex');
            }
            // Set revocation tags
            credentialRecord.setTags({
                anonCredsRevocationRegistryId: revocationRegistryDefinitionId,
                anonCredsCredentialRevocationId: revocationRegistryIndex.toString(),
            });
        }
        // Set the metadata
        credentialRecord.metadata.set(metadata_1.AnonCredsCredentialMetadataKey, {
            schemaId: offer.schema_id,
            credentialDefinitionId: offer.cred_def_id,
            credentialRevocationId: revocationRegistryIndex === null || revocationRegistryIndex === void 0 ? void 0 : revocationRegistryIndex.toString(),
            revocationRegistryId: revocationRegistryDefinitionId,
        });
        const attachment = this.getFormatData(offer, format.attachmentId);
        return { format, attachment, previewAttributes };
    }
    async assertPreviewAttributesMatchSchemaAttributes(agentContext, offer, attributes) {
        const { schema } = await (0, utils_1.fetchSchema)(agentContext, offer.schema_id);
        (0, credential_1.assertAttributesMatch)(schema, attributes);
    }
    /**
     * Get linked attachments for anoncreds format from a proposal message. This allows attachments
     * to be copied across to old style credential records
     *
     * @param options ProposeCredentialOptions object containing (optionally) the linked attachments
     * @return array of linked attachments or undefined if none present
     */
    getCredentialLinkedAttachments(attributes, linkedAttachments) {
        if (!linkedAttachments && !attributes) {
            return {};
        }
        let previewAttributes = attributes !== null && attributes !== void 0 ? attributes : [];
        let attachments;
        if (linkedAttachments) {
            // there are linked attachments so transform into the attribute field of the CredentialPreview object for
            // this proposal
            previewAttributes = (0, credential_1.createAndLinkAttachmentsToPreview)(linkedAttachments, previewAttributes);
            attachments = linkedAttachments.map((linkedAttachment) => linkedAttachment.attachment);
        }
        return { attachments, previewAttributes };
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
            data: {
                base64: core_1.JsonEncoder.toBase64(data),
            },
        });
        return attachment;
    }
}
exports.AnonCredsCredentialFormatService = AnonCredsCredentialFormatService;
//# sourceMappingURL=AnonCredsCredentialFormatService.js.map