"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1CredentialProtocol = void 0;
const core_1 = require("@credo-ts/core");
const AnonCredsCredentialProposal_1 = require("../../../models/AnonCredsCredentialProposal");
const utils_1 = require("../../../utils");
const handlers_1 = require("./handlers");
const messages_1 = require("./messages");
class V1CredentialProtocol extends core_1.BaseCredentialProtocol {
    constructor({ indyCredentialFormat }) {
        super();
        /**
         * The version of the issue credential protocol this protocol supports
         */
        this.version = 'v1';
        // TODO: just create a new instance of LegacyIndyCredentialFormatService here so it makes the setup easier
        this.indyCredentialFormat = indyCredentialFormat;
    }
    /**
     * Registers the protocol implementation (handlers, feature registry) on the agent.
     */
    register(dependencyManager, featureRegistry) {
        // Register message handlers for the Issue Credential V1 Protocol
        dependencyManager.registerMessageHandlers([
            new handlers_1.V1ProposeCredentialHandler(this),
            new handlers_1.V1OfferCredentialHandler(this),
            new handlers_1.V1RequestCredentialHandler(this),
            new handlers_1.V1IssueCredentialHandler(this),
            new handlers_1.V1CredentialAckHandler(this),
            new handlers_1.V1CredentialProblemReportHandler(this),
        ]);
        // Register Issue Credential V1 in feature registry, with supported roles
        featureRegistry.register(new core_1.Protocol({
            id: 'https://didcomm.org/issue-credential/1.0',
            roles: ['holder', 'issuer'],
        }));
    }
    /**
     * Create a {@link ProposeCredentialMessage} not bound to an existing credential exchange.
     * To create a proposal as response to an existing credential exchange, use {@link createProposalAsResponse}.
     *
     * @param options The object containing config options
     * @returns Object containing proposal message and associated credential record
     *
     */
    async createProposal(agentContext, { connectionRecord, credentialFormats, comment, autoAcceptCredential, }) {
        this.assertOnlyIndyFormat(credentialFormats);
        const credentialRepository = agentContext.dependencyManager.resolve(core_1.CredentialRepository);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        if (!credentialFormats.indy) {
            throw new core_1.CredoError('Missing indy credential format in v1 create proposal call.');
        }
        // TODO: linked attachments are broken currently. We never include them in the messages.
        // The linking with previews does work, so it shouldn't be too much work to re-enable this.
        const { linkedAttachments } = credentialFormats.indy;
        // Create record
        const credentialRecord = new core_1.CredentialExchangeRecord({
            connectionId: connectionRecord.id,
            threadId: core_1.utils.uuid(),
            state: core_1.CredentialState.ProposalSent,
            role: core_1.CredentialRole.Holder,
            linkedAttachments: linkedAttachments === null || linkedAttachments === void 0 ? void 0 : linkedAttachments.map((linkedAttachment) => linkedAttachment.attachment),
            autoAcceptCredential,
            protocolVersion: 'v1',
        });
        // call create proposal for validation of the proposal and addition of linked attachments
        const { previewAttributes, attachment } = await this.indyCredentialFormat.createProposal(agentContext, {
            credentialFormats,
            credentialRecord,
        });
        // Transform the attachment into the attachment payload and use that to construct the v1 message
        const indyCredentialProposal = core_1.JsonTransformer.fromJSON(attachment.getDataAsJson(), AnonCredsCredentialProposal_1.AnonCredsCredentialProposal);
        const credentialProposal = previewAttributes
            ? new messages_1.V1CredentialPreview({
                attributes: previewAttributes,
            })
            : undefined;
        // Create message
        const message = new messages_1.V1ProposeCredentialMessage(Object.assign(Object.assign({}, indyCredentialProposal), { id: credentialRecord.threadId, credentialPreview: credentialProposal, comment }));
        await didCommMessageRepository.saveAgentMessage(agentContext, {
            agentMessage: message,
            role: core_1.DidCommMessageRole.Sender,
            associatedRecordId: credentialRecord.id,
        });
        credentialRecord.credentialAttributes = credentialProposal === null || credentialProposal === void 0 ? void 0 : credentialProposal.attributes;
        await credentialRepository.save(agentContext, credentialRecord);
        this.emitStateChangedEvent(agentContext, credentialRecord, null);
        return { credentialRecord, message };
    }
    /**
     * Process a received {@link ProposeCredentialMessage}. This will not accept the credential proposal
     * or send a credential offer. It will only create a new, or update the existing credential record with
     * the information from the credential proposal message. Use {@link createOfferAsResponse}
     * after calling this method to create a credential offer.
     *
     * @param messageContext The message context containing a credential proposal message
     * @returns credential record associated with the credential proposal message
     *
     */
    async processProposal(messageContext) {
        const { message: proposalMessage, connection, agentContext } = messageContext;
        const credentialRepository = agentContext.dependencyManager.resolve(core_1.CredentialRepository);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        // TODO: with this method, we should update the credential protocol to use the ConnectionApi, so it
        // only depends on the public api, rather than the internal API (this helps with breaking changes)
        const connectionService = agentContext.dependencyManager.resolve(core_1.ConnectionService);
        agentContext.config.logger.debug(`Processing credential proposal with message id ${proposalMessage.id}`);
        let credentialRecord = await this.findByProperties(messageContext.agentContext, {
            threadId: proposalMessage.threadId,
            role: core_1.CredentialRole.Issuer,
            connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
        });
        // Credential record already exists, this is a response to an earlier message sent by us
        if (credentialRecord) {
            agentContext.config.logger.debug('Credential record already exists for incoming proposal');
            // Assert
            credentialRecord.assertProtocolVersion('v1');
            credentialRecord.assertState(core_1.CredentialState.OfferSent);
            const lastReceivedMessage = await didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
                associatedRecordId: credentialRecord.id,
                messageClass: messages_1.V1ProposeCredentialMessage,
                role: core_1.DidCommMessageRole.Receiver,
            });
            const lastSentMessage = await didCommMessageRepository.getAgentMessage(messageContext.agentContext, {
                associatedRecordId: credentialRecord.id,
                messageClass: messages_1.V1OfferCredentialMessage,
                role: core_1.DidCommMessageRole.Sender,
            });
            await connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastReceivedMessage,
                lastSentMessage,
                expectedConnectionId: credentialRecord.connectionId,
            });
            await this.indyCredentialFormat.processProposal(messageContext.agentContext, {
                credentialRecord,
                attachment: new core_1.Attachment({
                    data: new core_1.AttachmentData({
                        json: core_1.JsonTransformer.toJSON(this.rfc0592ProposalFromV1ProposeMessage(proposalMessage)),
                    }),
                }),
            });
            // Update record
            await this.updateState(messageContext.agentContext, credentialRecord, core_1.CredentialState.ProposalReceived);
            await didCommMessageRepository.saveOrUpdateAgentMessage(messageContext.agentContext, {
                agentMessage: proposalMessage,
                role: core_1.DidCommMessageRole.Receiver,
                associatedRecordId: credentialRecord.id,
            });
        }
        else {
            agentContext.config.logger.debug('Credential record does not exists yet for incoming proposal');
            // Assert
            await connectionService.assertConnectionOrOutOfBandExchange(messageContext);
            // No credential record exists with thread id
            credentialRecord = new core_1.CredentialExchangeRecord({
                connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
                threadId: proposalMessage.threadId,
                state: core_1.CredentialState.ProposalReceived,
                role: core_1.CredentialRole.Issuer,
                protocolVersion: 'v1',
            });
            // Save record
            await credentialRepository.save(messageContext.agentContext, credentialRecord);
            this.emitStateChangedEvent(messageContext.agentContext, credentialRecord, null);
            await didCommMessageRepository.saveAgentMessage(messageContext.agentContext, {
                agentMessage: proposalMessage,
                role: core_1.DidCommMessageRole.Receiver,
                associatedRecordId: credentialRecord.id,
            });
        }
        return credentialRecord;
    }
    /**
     * Processing an incoming credential message and create a credential offer as a response
     * @param options The object containing config options
     * @returns Object containing proposal message and associated credential record
     */
    async acceptProposal(agentContext, { credentialRecord, credentialFormats, comment, autoAcceptCredential, }) {
        var _a;
        // Assert
        credentialRecord.assertProtocolVersion('v1');
        credentialRecord.assertState(core_1.CredentialState.ProposalReceived);
        if (credentialFormats)
            this.assertOnlyIndyFormat(credentialFormats);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        const proposalMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: credentialRecord.id,
            messageClass: messages_1.V1ProposeCredentialMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        // NOTE: We set the credential attributes from the proposal on the record as we've 'accepted' them
        // and can now use them to create the offer in the format services. It may be overwritten later on
        // if the user provided other attributes in the credentialFormats array.
        credentialRecord.credentialAttributes = (_a = proposalMessage.credentialPreview) === null || _a === void 0 ? void 0 : _a.attributes;
        const { attachment, previewAttributes } = await this.indyCredentialFormat.acceptProposal(agentContext, {
            attachmentId: messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID,
            credentialFormats,
            credentialRecord,
            proposalAttachment: new core_1.Attachment({
                data: new core_1.AttachmentData({
                    json: core_1.JsonTransformer.toJSON(this.rfc0592ProposalFromV1ProposeMessage(proposalMessage)),
                }),
            }),
        });
        if (!previewAttributes) {
            throw new core_1.CredoError('Missing required credential preview attributes from indy format service');
        }
        const message = new messages_1.V1OfferCredentialMessage({
            comment,
            offerAttachments: [attachment],
            credentialPreview: new messages_1.V1CredentialPreview({
                attributes: previewAttributes,
            }),
            attachments: credentialRecord.linkedAttachments,
        });
        message.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
        credentialRecord.credentialAttributes = message.credentialPreview.attributes;
        credentialRecord.autoAcceptCredential = autoAcceptCredential !== null && autoAcceptCredential !== void 0 ? autoAcceptCredential : credentialRecord.autoAcceptCredential;
        await this.updateState(agentContext, credentialRecord, core_1.CredentialState.OfferSent);
        await didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
            agentMessage: message,
            role: core_1.DidCommMessageRole.Sender,
            associatedRecordId: credentialRecord.id,
        });
        return { credentialRecord, message };
    }
    /**
     * Negotiate a credential proposal as issuer (by sending a credential offer message) to the connection
     * associated with the credential record.
     *
     * @param options configuration for the offer see {@link NegotiateCredentialProposalOptions}
     * @returns Credential record associated with the credential offer and the corresponding new offer message
     *
     */
    async negotiateProposal(agentContext, { credentialFormats, credentialRecord, comment, autoAcceptCredential, }) {
        // Assert
        credentialRecord.assertProtocolVersion('v1');
        credentialRecord.assertState(core_1.CredentialState.ProposalReceived);
        this.assertOnlyIndyFormat(credentialFormats);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        const { attachment, previewAttributes } = await this.indyCredentialFormat.createOffer(agentContext, {
            attachmentId: messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID,
            credentialFormats,
            credentialRecord,
        });
        if (!previewAttributes) {
            throw new core_1.CredoError('Missing required credential preview attributes from indy format service');
        }
        const message = new messages_1.V1OfferCredentialMessage({
            comment,
            offerAttachments: [attachment],
            credentialPreview: new messages_1.V1CredentialPreview({
                attributes: previewAttributes,
            }),
            attachments: credentialRecord.linkedAttachments,
        });
        message.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
        credentialRecord.credentialAttributes = message.credentialPreview.attributes;
        credentialRecord.autoAcceptCredential = autoAcceptCredential !== null && autoAcceptCredential !== void 0 ? autoAcceptCredential : credentialRecord.autoAcceptCredential;
        await this.updateState(agentContext, credentialRecord, core_1.CredentialState.OfferSent);
        await didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
            agentMessage: message,
            role: core_1.DidCommMessageRole.Sender,
            associatedRecordId: credentialRecord.id,
        });
        return { credentialRecord, message };
    }
    /**
     * Create a {@link OfferCredentialMessage} not bound to an existing credential exchange.
     * To create an offer as response to an existing credential exchange, use {@link V1CredentialProtocol#createOfferAsResponse}.
     *
     * @param options The options containing config params for creating the credential offer
     * @returns Object containing offer message and associated credential record
     *
     */
    async createOffer(agentContext, { credentialFormats, autoAcceptCredential, comment, connectionRecord, }) {
        var _a, _b;
        // Assert
        this.assertOnlyIndyFormat(credentialFormats);
        const credentialRepository = agentContext.dependencyManager.resolve(core_1.CredentialRepository);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        if (!credentialFormats.indy) {
            throw new core_1.CredoError('Missing indy credential format data for v1 create offer');
        }
        // Create record
        const credentialRecord = new core_1.CredentialExchangeRecord({
            connectionId: connectionRecord === null || connectionRecord === void 0 ? void 0 : connectionRecord.id,
            threadId: core_1.utils.uuid(),
            linkedAttachments: (_a = credentialFormats.indy.linkedAttachments) === null || _a === void 0 ? void 0 : _a.map((linkedAttachments) => linkedAttachments.attachment),
            state: core_1.CredentialState.OfferSent,
            role: core_1.CredentialRole.Issuer,
            autoAcceptCredential,
            protocolVersion: 'v1',
        });
        const { attachment, previewAttributes } = await this.indyCredentialFormat.createOffer(agentContext, {
            attachmentId: messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID,
            credentialFormats,
            credentialRecord,
        });
        if (!previewAttributes) {
            throw new core_1.CredoError('Missing required credential preview from indy format service');
        }
        // Construct offer message
        const message = new messages_1.V1OfferCredentialMessage({
            id: credentialRecord.threadId,
            credentialPreview: new messages_1.V1CredentialPreview({
                attributes: previewAttributes,
            }),
            comment,
            offerAttachments: [attachment],
            attachments: (_b = credentialFormats.indy.linkedAttachments) === null || _b === void 0 ? void 0 : _b.map((linkedAttachments) => linkedAttachments.attachment),
        });
        await didCommMessageRepository.saveAgentMessage(agentContext, {
            associatedRecordId: credentialRecord.id,
            agentMessage: message,
            role: core_1.DidCommMessageRole.Sender,
        });
        credentialRecord.credentialAttributes = message.credentialPreview.attributes;
        await credentialRepository.save(agentContext, credentialRecord);
        this.emitStateChangedEvent(agentContext, credentialRecord, null);
        return { message, credentialRecord };
    }
    /**
     * Process a received {@link OfferCredentialMessage}. This will not accept the credential offer
     * or send a credential request. It will only create a new credential record with
     * the information from the credential offer message. Use {@link createRequest}
     * after calling this method to create a credential request.
     *
     * @param messageContext The message context containing a credential request message
     * @returns credential record associated with the credential offer message
     *
     */
    async processOffer(messageContext) {
        var _a;
        const { message: offerMessage, connection, agentContext } = messageContext;
        const credentialRepository = agentContext.dependencyManager.resolve(core_1.CredentialRepository);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        // TODO: with this method, we should update the credential protocol to use the ConnectionApi, so it
        // only depends on the public api, rather than the internal API (this helps with breaking changes)
        const connectionService = agentContext.dependencyManager.resolve(core_1.ConnectionService);
        agentContext.config.logger.debug(`Processing credential offer with id ${offerMessage.id}`);
        let credentialRecord = await this.findByProperties(agentContext, {
            threadId: offerMessage.threadId,
            role: core_1.CredentialRole.Holder,
            connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
        });
        const offerAttachment = offerMessage.getOfferAttachmentById(messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID);
        if (!offerAttachment) {
            throw new core_1.CredoError(`Indy attachment with id ${messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID} not found in offer message`);
        }
        if (credentialRecord) {
            const lastSentMessage = await didCommMessageRepository.getAgentMessage(messageContext.agentContext, {
                associatedRecordId: credentialRecord.id,
                messageClass: messages_1.V1ProposeCredentialMessage,
                role: core_1.DidCommMessageRole.Sender,
            });
            const lastReceivedMessage = await didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
                associatedRecordId: credentialRecord.id,
                messageClass: messages_1.V1OfferCredentialMessage,
                role: core_1.DidCommMessageRole.Receiver,
            });
            // Assert
            credentialRecord.assertProtocolVersion('v1');
            credentialRecord.assertState(core_1.CredentialState.ProposalSent);
            await connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastReceivedMessage,
                lastSentMessage,
                expectedConnectionId: credentialRecord.connectionId,
            });
            await this.indyCredentialFormat.processOffer(messageContext.agentContext, {
                credentialRecord,
                attachment: offerAttachment,
            });
            await didCommMessageRepository.saveOrUpdateAgentMessage(messageContext.agentContext, {
                agentMessage: offerMessage,
                role: core_1.DidCommMessageRole.Receiver,
                associatedRecordId: credentialRecord.id,
            });
            await this.updateState(messageContext.agentContext, credentialRecord, core_1.CredentialState.OfferReceived);
            return credentialRecord;
        }
        else {
            // Assert
            await connectionService.assertConnectionOrOutOfBandExchange(messageContext);
            // No credential record exists with thread id
            credentialRecord = new core_1.CredentialExchangeRecord({
                connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
                threadId: offerMessage.threadId,
                parentThreadId: (_a = offerMessage.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId,
                state: core_1.CredentialState.OfferReceived,
                role: core_1.CredentialRole.Holder,
                protocolVersion: 'v1',
            });
            await this.indyCredentialFormat.processOffer(messageContext.agentContext, {
                credentialRecord,
                attachment: offerAttachment,
            });
            // Save in repository
            await didCommMessageRepository.saveAgentMessage(messageContext.agentContext, {
                agentMessage: offerMessage,
                role: core_1.DidCommMessageRole.Receiver,
                associatedRecordId: credentialRecord.id,
            });
            await credentialRepository.save(messageContext.agentContext, credentialRecord);
            this.emitStateChangedEvent(messageContext.agentContext, credentialRecord, null);
            return credentialRecord;
        }
    }
    /**
     * Create a {@link RequestCredentialMessage} as response to a received credential offer.
     *
     * @param options configuration to use for the credential request
     * @returns Object containing request message and associated credential record
     *
     */
    async acceptOffer(agentContext, { credentialRecord, credentialFormats, comment, autoAcceptCredential, }) {
        var _a, _b;
        // Assert credential
        credentialRecord.assertProtocolVersion('v1');
        credentialRecord.assertState(core_1.CredentialState.OfferReceived);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        const offerMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: credentialRecord.id,
            messageClass: messages_1.V1OfferCredentialMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        const offerAttachment = offerMessage.getOfferAttachmentById(messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID);
        if (!offerAttachment) {
            throw new core_1.CredoError(`Indy attachment with id ${messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID} not found in offer message`);
        }
        const { attachment } = await this.indyCredentialFormat.acceptOffer(agentContext, {
            credentialRecord,
            credentialFormats,
            attachmentId: messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
            offerAttachment,
        });
        const requestMessage = new messages_1.V1RequestCredentialMessage({
            comment,
            requestAttachments: [attachment],
            attachments: (_a = offerMessage.appendedAttachments) === null || _a === void 0 ? void 0 : _a.filter((attachment) => (0, core_1.isLinkedAttachment)(attachment)),
        });
        requestMessage.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
        credentialRecord.credentialAttributes = offerMessage.credentialPreview.attributes;
        credentialRecord.autoAcceptCredential = autoAcceptCredential !== null && autoAcceptCredential !== void 0 ? autoAcceptCredential : credentialRecord.autoAcceptCredential;
        credentialRecord.linkedAttachments = (_b = offerMessage.appendedAttachments) === null || _b === void 0 ? void 0 : _b.filter((attachment) => (0, core_1.isLinkedAttachment)(attachment));
        await didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
            agentMessage: requestMessage,
            associatedRecordId: credentialRecord.id,
            role: core_1.DidCommMessageRole.Sender,
        });
        await this.updateState(agentContext, credentialRecord, core_1.CredentialState.RequestSent);
        return { message: requestMessage, credentialRecord };
    }
    /**
     * Process a received {@link RequestCredentialMessage}. This will not accept the credential request
     * or send a credential. It will only update the existing credential record with
     * the information from the credential request message. Use {@link createCredential}
     * after calling this method to create a credential.
     *
     * @param messageContext The message context containing a credential request message
     * @returns credential record associated with the credential request message
     *
     */
    async negotiateOffer(agentContext, { credentialFormats, credentialRecord, autoAcceptCredential, comment, }) {
        var _a;
        // Assert
        credentialRecord.assertProtocolVersion('v1');
        credentialRecord.assertState(core_1.CredentialState.OfferReceived);
        this.assertOnlyIndyFormat(credentialFormats);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        if (!credentialRecord.connectionId) {
            throw new core_1.CredoError(`No connectionId found for credential record '${credentialRecord.id}'. Connection-less issuance does not support negotiation.`);
        }
        if (!credentialFormats.indy) {
            throw new core_1.CredoError('Missing indy credential format in v1 negotiate proposal call.');
        }
        const { linkedAttachments } = credentialFormats.indy;
        // call create proposal for validation of the proposal and addition of linked attachments
        // As the format is different for v1 of the issue credential protocol we won't be using the attachment
        const { previewAttributes, attachment } = await this.indyCredentialFormat.createProposal(agentContext, {
            credentialFormats,
            credentialRecord,
        });
        // Transform the attachment into the attachment payload and use that to construct the v1 message
        const indyCredentialProposal = core_1.JsonTransformer.fromJSON(attachment.getDataAsJson(), AnonCredsCredentialProposal_1.AnonCredsCredentialProposal);
        const credentialProposal = previewAttributes
            ? new messages_1.V1CredentialPreview({
                attributes: previewAttributes,
            })
            : undefined;
        // Create message
        const message = new messages_1.V1ProposeCredentialMessage(Object.assign(Object.assign({}, indyCredentialProposal), { credentialPreview: credentialProposal, comment }));
        message.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
        await didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
            agentMessage: message,
            role: core_1.DidCommMessageRole.Sender,
            associatedRecordId: credentialRecord.id,
        });
        // Update record
        credentialRecord.credentialAttributes = (_a = message.credentialPreview) === null || _a === void 0 ? void 0 : _a.attributes;
        credentialRecord.linkedAttachments = linkedAttachments === null || linkedAttachments === void 0 ? void 0 : linkedAttachments.map((attachment) => attachment.attachment);
        credentialRecord.autoAcceptCredential = autoAcceptCredential !== null && autoAcceptCredential !== void 0 ? autoAcceptCredential : credentialRecord.autoAcceptCredential;
        await this.updateState(agentContext, credentialRecord, core_1.CredentialState.ProposalSent);
        return { credentialRecord, message };
    }
    /**
     * Starting from a request is not supported in v1 of the issue credential protocol
     * because indy doesn't allow to start from a request
     */
    async createRequest() {
        throw new core_1.CredoError('Starting from a request is not supported for v1 issue credential protocol');
    }
    async processRequest(messageContext) {
        const { message: requestMessage, connection, agentContext } = messageContext;
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        // TODO: with this method, we should update the credential protocol to use the ConnectionApi, so it
        // only depends on the public api, rather than the internal API (this helps with breaking changes)
        const connectionService = agentContext.dependencyManager.resolve(core_1.ConnectionService);
        agentContext.config.logger.debug(`Processing credential request with id ${requestMessage.id}`);
        const credentialRecord = await this.getByProperties(messageContext.agentContext, {
            threadId: requestMessage.threadId,
            role: core_1.CredentialRole.Issuer,
        });
        agentContext.config.logger.trace('Credential record found when processing credential request', credentialRecord);
        const proposalMessage = await didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
            associatedRecordId: credentialRecord.id,
            messageClass: messages_1.V1ProposeCredentialMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        const offerMessage = await didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
            associatedRecordId: credentialRecord.id,
            messageClass: messages_1.V1OfferCredentialMessage,
            role: core_1.DidCommMessageRole.Sender,
        });
        // Assert
        credentialRecord.assertProtocolVersion('v1');
        credentialRecord.assertState(core_1.CredentialState.OfferSent);
        await connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
            lastReceivedMessage: proposalMessage !== null && proposalMessage !== void 0 ? proposalMessage : undefined,
            lastSentMessage: offerMessage !== null && offerMessage !== void 0 ? offerMessage : undefined,
            expectedConnectionId: credentialRecord.connectionId,
        });
        // This makes sure that the sender of the incoming message is authorized to do so.
        if (!credentialRecord.connectionId) {
            await connectionService.matchIncomingMessageToRequestMessageInOutOfBandExchange(messageContext, {
                expectedConnectionId: credentialRecord.connectionId,
            });
            credentialRecord.connectionId = connection === null || connection === void 0 ? void 0 : connection.id;
        }
        const requestAttachment = requestMessage.getRequestAttachmentById(messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID);
        if (!requestAttachment) {
            throw new core_1.CredoError(`Indy attachment with id ${messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID} not found in request message`);
        }
        await this.indyCredentialFormat.processRequest(messageContext.agentContext, {
            credentialRecord,
            attachment: requestAttachment,
        });
        await didCommMessageRepository.saveAgentMessage(messageContext.agentContext, {
            agentMessage: requestMessage,
            role: core_1.DidCommMessageRole.Receiver,
            associatedRecordId: credentialRecord.id,
        });
        await this.updateState(messageContext.agentContext, credentialRecord, core_1.CredentialState.RequestReceived);
        return credentialRecord;
    }
    /**
     * Create a {@link V1IssueCredentialMessage} as response to a received credential request.
     *
     * @returns Object containing issue credential message and associated credential record
     *
     */
    async acceptRequest(agentContext, { credentialRecord, credentialFormats, comment, autoAcceptCredential, }) {
        // Assert
        credentialRecord.assertProtocolVersion('v1');
        credentialRecord.assertState(core_1.CredentialState.RequestReceived);
        if (credentialFormats)
            this.assertOnlyIndyFormat(credentialFormats);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        const offerMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: credentialRecord.id,
            messageClass: messages_1.V1OfferCredentialMessage,
            role: core_1.DidCommMessageRole.Sender,
        });
        const requestMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: credentialRecord.id,
            messageClass: messages_1.V1RequestCredentialMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        const offerAttachment = offerMessage.getOfferAttachmentById(messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID);
        const requestAttachment = requestMessage.getRequestAttachmentById(messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID);
        if (!offerAttachment || !requestAttachment) {
            throw new core_1.CredoError(`Missing data payload in offer or request attachment in credential Record ${credentialRecord.id}`);
        }
        const { attachment } = await this.indyCredentialFormat.acceptRequest(agentContext, {
            credentialRecord,
            requestAttachment,
            offerAttachment,
            attachmentId: messages_1.INDY_CREDENTIAL_ATTACHMENT_ID,
            credentialFormats,
        });
        const issueMessage = new messages_1.V1IssueCredentialMessage({
            comment,
            credentialAttachments: [attachment],
            attachments: credentialRecord.linkedAttachments,
        });
        issueMessage.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
        issueMessage.setPleaseAck();
        await didCommMessageRepository.saveAgentMessage(agentContext, {
            agentMessage: issueMessage,
            associatedRecordId: credentialRecord.id,
            role: core_1.DidCommMessageRole.Sender,
        });
        credentialRecord.autoAcceptCredential = autoAcceptCredential !== null && autoAcceptCredential !== void 0 ? autoAcceptCredential : credentialRecord.autoAcceptCredential;
        await this.updateState(agentContext, credentialRecord, core_1.CredentialState.CredentialIssued);
        return { message: issueMessage, credentialRecord };
    }
    /**
     * Process an incoming {@link V1IssueCredentialMessage}
     *
     * @param messageContext The message context containing a credential acknowledgement message
     * @returns credential record associated with the credential acknowledgement message
     *
     */
    async processCredential(messageContext) {
        const { message: issueMessage, connection, agentContext } = messageContext;
        agentContext.config.logger.debug(`Processing credential with id ${issueMessage.id}`);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        // TODO: with this method, we should update the credential protocol to use the ConnectionApi, so it
        // only depends on the public api, rather than the internal API (this helps with breaking changes)
        const connectionService = agentContext.dependencyManager.resolve(core_1.ConnectionService);
        const credentialRecord = await this.getByProperties(messageContext.agentContext, {
            threadId: issueMessage.threadId,
            role: core_1.CredentialRole.Holder,
            connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
        });
        const requestCredentialMessage = await didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
            associatedRecordId: credentialRecord.id,
            messageClass: messages_1.V1RequestCredentialMessage,
            role: core_1.DidCommMessageRole.Sender,
        });
        const offerCredentialMessage = await didCommMessageRepository.findAgentMessage(messageContext.agentContext, {
            associatedRecordId: credentialRecord.id,
            messageClass: messages_1.V1OfferCredentialMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        // Assert
        credentialRecord.assertProtocolVersion('v1');
        credentialRecord.assertState(core_1.CredentialState.RequestSent);
        await connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
            lastReceivedMessage: offerCredentialMessage,
            lastSentMessage: requestCredentialMessage,
            expectedConnectionId: credentialRecord.connectionId,
        });
        const issueAttachment = issueMessage.getCredentialAttachmentById(messages_1.INDY_CREDENTIAL_ATTACHMENT_ID);
        if (!issueAttachment) {
            throw new core_1.CredoError('Missing indy credential attachment in processCredential');
        }
        const requestAttachment = requestCredentialMessage === null || requestCredentialMessage === void 0 ? void 0 : requestCredentialMessage.getRequestAttachmentById(messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID);
        if (!requestAttachment) {
            throw new core_1.CredoError('Missing indy credential request attachment in processCredential');
        }
        const offerAttachment = offerCredentialMessage === null || offerCredentialMessage === void 0 ? void 0 : offerCredentialMessage.getOfferAttachmentById(messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID);
        if (!offerAttachment) {
            throw new core_1.CredoError('Missing indy credential request attachment in processCredential');
        }
        await this.indyCredentialFormat.processCredential(messageContext.agentContext, {
            offerAttachment,
            attachment: issueAttachment,
            credentialRecord,
            requestAttachment,
        });
        await didCommMessageRepository.saveAgentMessage(messageContext.agentContext, {
            agentMessage: issueMessage,
            role: core_1.DidCommMessageRole.Receiver,
            associatedRecordId: credentialRecord.id,
        });
        await this.updateState(messageContext.agentContext, credentialRecord, core_1.CredentialState.CredentialReceived);
        return credentialRecord;
    }
    /**
     * Create a {@link CredentialAckMessage} as response to a received credential.
     *
     * @param credentialRecord The credential record for which to create the credential acknowledgement
     * @returns Object containing credential acknowledgement message and associated credential record
     *
     */
    async acceptCredential(agentContext, { credentialRecord }) {
        credentialRecord.assertProtocolVersion('v1');
        credentialRecord.assertState(core_1.CredentialState.CredentialReceived);
        // Create message
        const ackMessage = new messages_1.V1CredentialAckMessage({
            status: core_1.AckStatus.OK,
            threadId: credentialRecord.threadId,
        });
        ackMessage.setThread({ threadId: credentialRecord.threadId, parentThreadId: credentialRecord.parentThreadId });
        await this.updateState(agentContext, credentialRecord, core_1.CredentialState.Done);
        return { message: ackMessage, credentialRecord };
    }
    /**
     * Process a received {@link CredentialAckMessage}.
     *
     * @param messageContext The message context containing a credential acknowledgement message
     * @returns credential record associated with the credential acknowledgement message
     *
     */
    async processAck(messageContext) {
        const { message: ackMessage, connection, agentContext } = messageContext;
        agentContext.config.logger.debug(`Processing credential ack with id ${ackMessage.id}`);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        // TODO: with this method, we should update the credential protocol to use the ConnectionApi, so it
        // only depends on the public api, rather than the internal API (this helps with breaking changes)
        const connectionService = agentContext.dependencyManager.resolve(core_1.ConnectionService);
        const credentialRecord = await this.getByProperties(messageContext.agentContext, {
            threadId: ackMessage.threadId,
            role: core_1.CredentialRole.Issuer,
            connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
        });
        const requestCredentialMessage = await didCommMessageRepository.getAgentMessage(messageContext.agentContext, {
            associatedRecordId: credentialRecord.id,
            messageClass: messages_1.V1RequestCredentialMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        const issueCredentialMessage = await didCommMessageRepository.getAgentMessage(messageContext.agentContext, {
            associatedRecordId: credentialRecord.id,
            messageClass: messages_1.V1IssueCredentialMessage,
            role: core_1.DidCommMessageRole.Sender,
        });
        // Assert
        credentialRecord.assertProtocolVersion('v1');
        credentialRecord.assertState(core_1.CredentialState.CredentialIssued);
        await connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
            lastReceivedMessage: requestCredentialMessage,
            lastSentMessage: issueCredentialMessage,
            expectedConnectionId: credentialRecord.connectionId,
        });
        // Update record
        await this.updateState(messageContext.agentContext, credentialRecord, core_1.CredentialState.Done);
        return credentialRecord;
    }
    /**
     * Create a {@link V1CredentialProblemReportMessage} to be sent.
     *
     * @param message message to send
     * @returns a {@link V1CredentialProblemReportMessage}
     *
     */
    async createProblemReport(_agentContext, { credentialRecord, description }) {
        const message = new messages_1.V1CredentialProblemReportMessage({
            description: {
                en: description,
                code: core_1.CredentialProblemReportReason.IssuanceAbandoned,
            },
        });
        return { message, credentialRecord };
    }
    // AUTO RESPOND METHODS
    async shouldAutoRespondToProposal(agentContext, options) {
        const { credentialRecord, proposalMessage } = options;
        const credentialsModuleConfig = agentContext.dependencyManager.resolve(core_1.CredentialsModuleConfig);
        const autoAccept = (0, utils_1.composeCredentialAutoAccept)(credentialRecord.autoAcceptCredential, credentialsModuleConfig.autoAcceptCredentials);
        // Handle always / never cases
        if (autoAccept === core_1.AutoAcceptCredential.Always)
            return true;
        if (autoAccept === core_1.AutoAcceptCredential.Never)
            return false;
        const offerMessage = await this.findOfferMessage(agentContext, credentialRecord.id);
        // Do not auto accept if missing properties
        if (!offerMessage || !offerMessage.credentialPreview)
            return false;
        if (!proposalMessage.credentialPreview || !proposalMessage.credentialDefinitionId)
            return false;
        const credentialOfferJson = offerMessage.indyCredentialOffer;
        // Check if credential definition id matches
        if (!credentialOfferJson)
            return false;
        if (credentialOfferJson.cred_def_id !== proposalMessage.credentialDefinitionId)
            return false;
        // Check if preview values match
        return (0, utils_1.areCredentialPreviewAttributesEqual)(proposalMessage.credentialPreview.attributes, offerMessage.credentialPreview.attributes);
    }
    async shouldAutoRespondToOffer(agentContext, options) {
        const { credentialRecord, offerMessage } = options;
        const credentialsModuleConfig = agentContext.dependencyManager.resolve(core_1.CredentialsModuleConfig);
        const autoAccept = (0, utils_1.composeCredentialAutoAccept)(credentialRecord.autoAcceptCredential, credentialsModuleConfig.autoAcceptCredentials);
        // Handle always / never cases
        if (autoAccept === core_1.AutoAcceptCredential.Always)
            return true;
        if (autoAccept === core_1.AutoAcceptCredential.Never)
            return false;
        const proposalMessage = await this.findProposalMessage(agentContext, credentialRecord.id);
        // Do not auto accept if missing properties
        if (!offerMessage.credentialPreview)
            return false;
        if (!proposalMessage || !proposalMessage.credentialPreview || !proposalMessage.credentialDefinitionId)
            return false;
        const credentialOfferJson = offerMessage.indyCredentialOffer;
        // Check if credential definition id matches
        if (!credentialOfferJson)
            return false;
        if (credentialOfferJson.cred_def_id !== proposalMessage.credentialDefinitionId)
            return false;
        // Check if preview values match
        return (0, utils_1.areCredentialPreviewAttributesEqual)(proposalMessage.credentialPreview.attributes, offerMessage.credentialPreview.attributes);
    }
    async shouldAutoRespondToRequest(agentContext, options) {
        const { credentialRecord, requestMessage } = options;
        const credentialsModuleConfig = agentContext.dependencyManager.resolve(core_1.CredentialsModuleConfig);
        const autoAccept = (0, utils_1.composeCredentialAutoAccept)(credentialRecord.autoAcceptCredential, credentialsModuleConfig.autoAcceptCredentials);
        // Handle always / never cases
        if (autoAccept === core_1.AutoAcceptCredential.Always)
            return true;
        if (autoAccept === core_1.AutoAcceptCredential.Never)
            return false;
        const offerMessage = await this.findOfferMessage(agentContext, credentialRecord.id);
        if (!offerMessage)
            return false;
        const offerAttachment = offerMessage.getOfferAttachmentById(messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID);
        const requestAttachment = requestMessage.getRequestAttachmentById(messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID);
        if (!offerAttachment || !requestAttachment)
            return false;
        return this.indyCredentialFormat.shouldAutoRespondToRequest(agentContext, {
            credentialRecord,
            offerAttachment,
            requestAttachment,
        });
    }
    async shouldAutoRespondToCredential(agentContext, options) {
        const { credentialRecord, credentialMessage } = options;
        const credentialsModuleConfig = agentContext.dependencyManager.resolve(core_1.CredentialsModuleConfig);
        const autoAccept = (0, utils_1.composeCredentialAutoAccept)(credentialRecord.autoAcceptCredential, credentialsModuleConfig.autoAcceptCredentials);
        // Handle always / never cases
        if (autoAccept === core_1.AutoAcceptCredential.Always)
            return true;
        if (autoAccept === core_1.AutoAcceptCredential.Never)
            return false;
        const requestMessage = await this.findRequestMessage(agentContext, credentialRecord.id);
        const offerMessage = await this.findOfferMessage(agentContext, credentialRecord.id);
        const credentialAttachment = credentialMessage.getCredentialAttachmentById(messages_1.INDY_CREDENTIAL_ATTACHMENT_ID);
        if (!credentialAttachment)
            return false;
        const requestAttachment = requestMessage === null || requestMessage === void 0 ? void 0 : requestMessage.getRequestAttachmentById(messages_1.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID);
        if (!requestAttachment)
            return false;
        const offerAttachment = offerMessage === null || offerMessage === void 0 ? void 0 : offerMessage.getOfferAttachmentById(messages_1.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID);
        return this.indyCredentialFormat.shouldAutoRespondToCredential(agentContext, {
            credentialRecord,
            credentialAttachment,
            requestAttachment,
            offerAttachment,
        });
    }
    async findProposalMessage(agentContext, credentialExchangeId) {
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        return await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: credentialExchangeId,
            messageClass: messages_1.V1ProposeCredentialMessage,
        });
    }
    async findOfferMessage(agentContext, credentialExchangeId) {
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        return await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: credentialExchangeId,
            messageClass: messages_1.V1OfferCredentialMessage,
        });
    }
    async findRequestMessage(agentContext, credentialExchangeId) {
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        return await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: credentialExchangeId,
            messageClass: messages_1.V1RequestCredentialMessage,
        });
    }
    async findCredentialMessage(agentContext, credentialExchangeId) {
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        return await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: credentialExchangeId,
            messageClass: messages_1.V1IssueCredentialMessage,
        });
    }
    async getFormatData(agentContext, credentialExchangeId) {
        var _a, _b, _c, _d, _e;
        // TODO: we could looking at fetching all record using a single query and then filtering based on the type of the message.
        const [proposalMessage, offerMessage, requestMessage, credentialMessage] = await Promise.all([
            this.findProposalMessage(agentContext, credentialExchangeId),
            this.findOfferMessage(agentContext, credentialExchangeId),
            this.findRequestMessage(agentContext, credentialExchangeId),
            this.findCredentialMessage(agentContext, credentialExchangeId),
        ]);
        const indyProposal = proposalMessage
            ? core_1.JsonTransformer.toJSON(this.rfc0592ProposalFromV1ProposeMessage(proposalMessage))
            : undefined;
        const indyOffer = (_a = offerMessage === null || offerMessage === void 0 ? void 0 : offerMessage.indyCredentialOffer) !== null && _a !== void 0 ? _a : undefined;
        const indyRequest = (_b = requestMessage === null || requestMessage === void 0 ? void 0 : requestMessage.indyCredentialRequest) !== null && _b !== void 0 ? _b : undefined;
        const indyCredential = (_c = credentialMessage === null || credentialMessage === void 0 ? void 0 : credentialMessage.indyCredential) !== null && _c !== void 0 ? _c : undefined;
        return {
            proposalAttributes: (_d = proposalMessage === null || proposalMessage === void 0 ? void 0 : proposalMessage.credentialPreview) === null || _d === void 0 ? void 0 : _d.attributes,
            proposal: proposalMessage
                ? {
                    indy: indyProposal,
                }
                : undefined,
            offerAttributes: (_e = offerMessage === null || offerMessage === void 0 ? void 0 : offerMessage.credentialPreview) === null || _e === void 0 ? void 0 : _e.attributes,
            offer: offerMessage
                ? {
                    indy: indyOffer,
                }
                : undefined,
            request: requestMessage
                ? {
                    indy: indyRequest,
                }
                : undefined,
            credential: credentialMessage
                ? {
                    indy: indyCredential,
                }
                : undefined,
        };
    }
    rfc0592ProposalFromV1ProposeMessage(proposalMessage) {
        const indyCredentialProposal = new AnonCredsCredentialProposal_1.AnonCredsCredentialProposal({
            credentialDefinitionId: proposalMessage.credentialDefinitionId,
            schemaId: proposalMessage.schemaId,
            issuerDid: proposalMessage.issuerDid,
            schemaIssuerDid: proposalMessage.schemaIssuerDid,
            schemaName: proposalMessage.schemaName,
            schemaVersion: proposalMessage.schemaVersion,
        });
        return indyCredentialProposal;
    }
    assertOnlyIndyFormat(credentialFormats) {
        const formatKeys = Object.keys(credentialFormats);
        // It's fine to not have any formats in some cases, if indy is required the method that calls this should check for this
        if (formatKeys.length === 0)
            return;
        if (formatKeys.length !== 1 || !formatKeys.includes('indy')) {
            throw new core_1.CredoError('Only indy credential format is supported for issue credential v1 protocol');
        }
    }
    getFormatServiceForRecordType(credentialRecordType) {
        if (credentialRecordType !== this.indyCredentialFormat.credentialRecordType) {
            throw new core_1.CredoError(`Unsupported credential record type ${credentialRecordType} for v1 issue credential protocol (need ${this.indyCredentialFormat.credentialRecordType})`);
        }
        return this.indyCredentialFormat;
    }
}
exports.V1CredentialProtocol = V1CredentialProtocol;
//# sourceMappingURL=V1CredentialProtocol.js.map