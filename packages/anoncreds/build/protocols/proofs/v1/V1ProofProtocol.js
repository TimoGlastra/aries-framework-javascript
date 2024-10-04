"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1ProofProtocol = void 0;
const core_1 = require("@credo-ts/core");
const utils_1 = require("../../../utils");
const errors_1 = require("./errors");
const handlers_1 = require("./handlers");
const messages_1 = require("./messages");
const V1PresentationProblemReportMessage_1 = require("./messages/V1PresentationProblemReportMessage");
const V1PresentationPreview_1 = require("./models/V1PresentationPreview");
class V1ProofProtocol extends core_1.BaseProofProtocol {
    constructor({ indyProofFormat }) {
        super();
        /**
         * The version of the present proof protocol this protocol supports
         */
        this.version = 'v1';
        // TODO: just create a new instance of LegacyIndyProofFormatService here so it makes the setup easier
        this.indyProofFormat = indyProofFormat;
    }
    /**
     * Registers the protocol implementation (handlers, feature registry) on the agent.
     */
    register(dependencyManager, featureRegistry) {
        // Register message handlers for the Issue Credential V1 Protocol
        dependencyManager.registerMessageHandlers([
            new handlers_1.V1ProposePresentationHandler(this),
            new handlers_1.V1RequestPresentationHandler(this),
            new handlers_1.V1PresentationHandler(this),
            new handlers_1.V1PresentationAckHandler(this),
            new handlers_1.V1PresentationProblemReportHandler(this),
        ]);
        // Register Present Proof V1 in feature registry, with supported roles
        featureRegistry.register(new core_1.Protocol({
            id: 'https://didcomm.org/present-proof/1.0',
            roles: ['prover', 'verifier'],
        }));
    }
    async createProposal(agentContext, { proofFormats, connectionRecord, comment, parentThreadId, autoAcceptProof, }) {
        var _a, _b, _c;
        this.assertOnlyIndyFormat(proofFormats);
        const proofRepository = agentContext.dependencyManager.resolve(core_1.ProofRepository);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        if (!proofFormats.indy) {
            throw new core_1.CredoError('Missing indy proof format in v1 create proposal call.');
        }
        const presentationProposal = new V1PresentationPreview_1.V1PresentationPreview({
            attributes: (_a = proofFormats.indy) === null || _a === void 0 ? void 0 : _a.attributes,
            predicates: (_b = proofFormats.indy) === null || _b === void 0 ? void 0 : _b.predicates,
        });
        // validate input data from user
        core_1.MessageValidator.validateSync(presentationProposal);
        // Create message
        const message = new messages_1.V1ProposePresentationMessage({
            presentationProposal,
            comment,
        });
        if (parentThreadId)
            message.setThread({
                parentThreadId,
            });
        // Create record
        const proofRecord = new core_1.ProofExchangeRecord({
            connectionId: connectionRecord.id,
            threadId: message.threadId,
            parentThreadId: (_c = message.thread) === null || _c === void 0 ? void 0 : _c.parentThreadId,
            state: core_1.ProofState.ProposalSent,
            role: core_1.ProofRole.Prover,
            autoAcceptProof,
            protocolVersion: 'v1',
        });
        await didCommMessageRepository.saveAgentMessage(agentContext, {
            agentMessage: message,
            associatedRecordId: proofRecord.id,
            role: core_1.DidCommMessageRole.Sender,
        });
        await proofRepository.save(agentContext, proofRecord);
        this.emitStateChangedEvent(agentContext, proofRecord, null);
        return { proofRecord, message };
    }
    async processProposal(messageContext) {
        var _a;
        const { message: proposalMessage, connection, agentContext } = messageContext;
        const proofRepository = agentContext.dependencyManager.resolve(core_1.ProofRepository);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        // TODO: with this method, we should update the credential protocol to use the ConnectionApi, so it
        // only depends on the public api, rather than the internal API (this helps with breaking changes)
        const connectionService = agentContext.dependencyManager.resolve(core_1.ConnectionService);
        agentContext.config.logger.debug(`Processing presentation proposal with message id ${proposalMessage.id}`);
        let proofRecord = await this.findByProperties(agentContext, {
            threadId: proposalMessage.threadId,
            role: core_1.ProofRole.Verifier,
            connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
        });
        // Proof record already exists, this is a response to an earlier message sent by us
        if (proofRecord) {
            agentContext.config.logger.debug('Proof record already exists for incoming proposal');
            // Assert
            proofRecord.assertState(core_1.ProofState.RequestSent);
            proofRecord.assertProtocolVersion('v1');
            const lastReceivedMessage = await didCommMessageRepository.findAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V1ProposePresentationMessage,
                role: core_1.DidCommMessageRole.Receiver,
            });
            const lastSentMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V1RequestPresentationMessage,
                role: core_1.DidCommMessageRole.Sender,
            });
            await connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastReceivedMessage,
                lastSentMessage,
                expectedConnectionId: proofRecord.connectionId,
            });
            // Update record
            await didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: proposalMessage,
                associatedRecordId: proofRecord.id,
                role: core_1.DidCommMessageRole.Receiver,
            });
            await this.updateState(agentContext, proofRecord, core_1.ProofState.ProposalReceived);
        }
        else {
            agentContext.config.logger.debug('Proof record does not exist yet for incoming proposal');
            // Assert
            await connectionService.assertConnectionOrOutOfBandExchange(messageContext);
            // No proof record exists with thread id
            proofRecord = new core_1.ProofExchangeRecord({
                connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
                threadId: proposalMessage.threadId,
                parentThreadId: (_a = proposalMessage.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId,
                state: core_1.ProofState.ProposalReceived,
                role: core_1.ProofRole.Verifier,
                protocolVersion: 'v1',
            });
            await didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: proposalMessage,
                associatedRecordId: proofRecord.id,
                role: core_1.DidCommMessageRole.Receiver,
            });
            // Save record
            await proofRepository.save(agentContext, proofRecord);
            this.emitStateChangedEvent(agentContext, proofRecord, null);
        }
        return proofRecord;
    }
    async acceptProposal(agentContext, { proofRecord, proofFormats, comment, autoAcceptProof, }) {
        var _a, _b;
        // Assert
        proofRecord.assertProtocolVersion('v1');
        proofRecord.assertState(core_1.ProofState.ProposalReceived);
        if (proofFormats)
            this.assertOnlyIndyFormat(proofFormats);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        const proposalMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1ProposePresentationMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        const indyFormat = proofFormats === null || proofFormats === void 0 ? void 0 : proofFormats.indy;
        // Create a proof request from the preview, so we can let the messages
        // be handled using the indy proof format which supports RFC0592
        const requestFromPreview = (0, utils_1.createRequestFromPreview)({
            attributes: proposalMessage.presentationProposal.attributes,
            predicates: proposalMessage.presentationProposal.predicates,
            name: (_a = indyFormat === null || indyFormat === void 0 ? void 0 : indyFormat.name) !== null && _a !== void 0 ? _a : 'Proof Request',
            version: (_b = indyFormat === null || indyFormat === void 0 ? void 0 : indyFormat.version) !== null && _b !== void 0 ? _b : '1.0',
            nonce: await agentContext.wallet.generateNonce(),
        });
        const proposalAttachment = new core_1.Attachment({
            data: {
                json: core_1.JsonTransformer.toJSON(requestFromPreview),
            },
        });
        // Create message
        const { attachment } = await this.indyProofFormat.acceptProposal(agentContext, {
            attachmentId: messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID,
            proofRecord,
            proposalAttachment,
        });
        const requestPresentationMessage = new messages_1.V1RequestPresentationMessage({
            comment,
            requestAttachments: [attachment],
        });
        requestPresentationMessage.setThread({
            threadId: proofRecord.threadId,
            parentThreadId: proofRecord.parentThreadId,
        });
        await didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
            agentMessage: requestPresentationMessage,
            associatedRecordId: proofRecord.id,
            role: core_1.DidCommMessageRole.Sender,
        });
        // Update record
        proofRecord.autoAcceptProof = autoAcceptProof !== null && autoAcceptProof !== void 0 ? autoAcceptProof : proofRecord.autoAcceptProof;
        await this.updateState(agentContext, proofRecord, core_1.ProofState.RequestSent);
        return { message: requestPresentationMessage, proofRecord };
    }
    async negotiateProposal(agentContext, { proofFormats, proofRecord, comment, autoAcceptProof, }) {
        // Assert
        proofRecord.assertProtocolVersion('v1');
        proofRecord.assertState(core_1.ProofState.ProposalReceived);
        this.assertOnlyIndyFormat(proofFormats);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        // Create message
        const { attachment } = await this.indyProofFormat.createRequest(agentContext, {
            attachmentId: messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID,
            proofFormats,
            proofRecord,
        });
        const requestPresentationMessage = new messages_1.V1RequestPresentationMessage({
            comment,
            requestAttachments: [attachment],
        });
        requestPresentationMessage.setThread({
            threadId: proofRecord.threadId,
            parentThreadId: proofRecord.parentThreadId,
        });
        await didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
            agentMessage: requestPresentationMessage,
            associatedRecordId: proofRecord.id,
            role: core_1.DidCommMessageRole.Sender,
        });
        proofRecord.autoAcceptProof = autoAcceptProof !== null && autoAcceptProof !== void 0 ? autoAcceptProof : proofRecord.autoAcceptProof;
        await this.updateState(agentContext, proofRecord, core_1.ProofState.RequestSent);
        return { message: requestPresentationMessage, proofRecord };
    }
    async createRequest(agentContext, { proofFormats, connectionRecord, comment, parentThreadId, autoAcceptProof, }) {
        this.assertOnlyIndyFormat(proofFormats);
        const proofRepository = agentContext.dependencyManager.resolve(core_1.ProofRepository);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        if (!proofFormats.indy) {
            throw new core_1.CredoError('Missing indy proof request data for v1 create request');
        }
        // Create record
        const proofRecord = new core_1.ProofExchangeRecord({
            connectionId: connectionRecord === null || connectionRecord === void 0 ? void 0 : connectionRecord.id,
            threadId: core_1.utils.uuid(),
            parentThreadId,
            state: core_1.ProofState.RequestSent,
            role: core_1.ProofRole.Verifier,
            autoAcceptProof,
            protocolVersion: 'v1',
        });
        // Create message
        const { attachment } = await this.indyProofFormat.createRequest(agentContext, {
            attachmentId: messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID,
            proofFormats,
            proofRecord,
        });
        // Construct request message
        const message = new messages_1.V1RequestPresentationMessage({
            id: proofRecord.threadId,
            comment,
            requestAttachments: [attachment],
        });
        message.setThread({
            threadId: proofRecord.threadId,
            parentThreadId: proofRecord.parentThreadId,
        });
        await didCommMessageRepository.saveAgentMessage(agentContext, {
            agentMessage: message,
            associatedRecordId: proofRecord.id,
            role: core_1.DidCommMessageRole.Sender,
        });
        await proofRepository.save(agentContext, proofRecord);
        this.emitStateChangedEvent(agentContext, proofRecord, null);
        return { message, proofRecord };
    }
    async processRequest(messageContext) {
        var _a;
        const { message: proofRequestMessage, connection, agentContext } = messageContext;
        const proofRepository = agentContext.dependencyManager.resolve(core_1.ProofRepository);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        // TODO: with this method, we should update the credential protocol to use the ConnectionApi, so it
        // only depends on the public api, rather than the internal API (this helps with breaking changes)
        const connectionService = agentContext.dependencyManager.resolve(core_1.ConnectionService);
        agentContext.config.logger.debug(`Processing presentation request with id ${proofRequestMessage.id}`);
        let proofRecord = await this.findByProperties(agentContext, {
            threadId: proofRequestMessage.threadId,
            role: core_1.ProofRole.Prover,
            connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
        });
        const requestAttachment = proofRequestMessage.getRequestAttachmentById(messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID);
        if (!requestAttachment) {
            throw new core_1.CredoError(`Indy attachment with id ${messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID} not found in request message`);
        }
        // proof record already exists, this means we are the message is sent as reply to a proposal we sent
        if (proofRecord) {
            const lastReceivedMessage = await didCommMessageRepository.findAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V1RequestPresentationMessage,
                role: core_1.DidCommMessageRole.Receiver,
            });
            const lastSentMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
                associatedRecordId: proofRecord.id,
                messageClass: messages_1.V1ProposePresentationMessage,
                role: core_1.DidCommMessageRole.Sender,
            });
            // Assert
            proofRecord.assertProtocolVersion('v1');
            proofRecord.assertState(core_1.ProofState.ProposalSent);
            await connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
                lastReceivedMessage,
                lastSentMessage,
                expectedConnectionId: proofRecord.connectionId,
            });
            await this.indyProofFormat.processRequest(agentContext, {
                attachment: requestAttachment,
                proofRecord,
            });
            await didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
                agentMessage: proofRequestMessage,
                associatedRecordId: proofRecord.id,
                role: core_1.DidCommMessageRole.Receiver,
            });
            await this.updateState(agentContext, proofRecord, core_1.ProofState.RequestReceived);
        }
        else {
            // Assert
            await connectionService.assertConnectionOrOutOfBandExchange(messageContext);
            // No proof record exists with thread id
            proofRecord = new core_1.ProofExchangeRecord({
                connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
                threadId: proofRequestMessage.threadId,
                parentThreadId: (_a = proofRequestMessage.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId,
                state: core_1.ProofState.RequestReceived,
                role: core_1.ProofRole.Prover,
                protocolVersion: 'v1',
            });
            await this.indyProofFormat.processRequest(agentContext, {
                attachment: requestAttachment,
                proofRecord,
            });
            await didCommMessageRepository.saveAgentMessage(agentContext, {
                agentMessage: proofRequestMessage,
                associatedRecordId: proofRecord.id,
                role: core_1.DidCommMessageRole.Receiver,
            });
            // Save in repository
            await proofRepository.save(agentContext, proofRecord);
            this.emitStateChangedEvent(agentContext, proofRecord, null);
        }
        return proofRecord;
    }
    async negotiateRequest(agentContext, { proofFormats, proofRecord, comment, autoAcceptProof, }) {
        var _a, _b;
        // Assert
        proofRecord.assertProtocolVersion('v1');
        proofRecord.assertState(core_1.ProofState.RequestReceived);
        this.assertOnlyIndyFormat(proofFormats);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        if (!proofRecord.connectionId) {
            throw new core_1.CredoError(`No connectionId found for proof record '${proofRecord.id}'. Connection-less verification does not support negotiation.`);
        }
        if (!proofFormats.indy) {
            throw new core_1.CredoError('Missing indy proof format in v1 negotiate request call.');
        }
        const presentationProposal = new V1PresentationPreview_1.V1PresentationPreview({
            attributes: (_a = proofFormats.indy) === null || _a === void 0 ? void 0 : _a.attributes,
            predicates: (_b = proofFormats.indy) === null || _b === void 0 ? void 0 : _b.predicates,
        });
        // validate input data from user
        core_1.MessageValidator.validateSync(presentationProposal);
        const message = new messages_1.V1ProposePresentationMessage({
            comment,
            presentationProposal,
        });
        message.setThread({ threadId: proofRecord.threadId, parentThreadId: proofRecord.parentThreadId });
        await didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
            agentMessage: message,
            associatedRecordId: proofRecord.id,
            role: core_1.DidCommMessageRole.Sender,
        });
        // Update record
        proofRecord.autoAcceptProof = autoAcceptProof !== null && autoAcceptProof !== void 0 ? autoAcceptProof : proofRecord.autoAcceptProof;
        await this.updateState(agentContext, proofRecord, core_1.ProofState.ProposalSent);
        return { proofRecord, message: message };
    }
    async acceptRequest(agentContext, { proofRecord, proofFormats, autoAcceptProof, comment, }) {
        var _a, _b;
        // Assert
        proofRecord.assertProtocolVersion('v1');
        proofRecord.assertState(core_1.ProofState.RequestReceived);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        const requestMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1RequestPresentationMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        const proposalMessage = await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1ProposePresentationMessage,
            role: core_1.DidCommMessageRole.Sender,
        });
        const requestAttachment = requestMessage.getRequestAttachmentById(messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID);
        const indyProofRequest = requestMessage.indyProofRequest;
        if (!requestAttachment || !indyProofRequest) {
            throw new errors_1.V1PresentationProblemReportError(`Missing indy attachment in request message for presentation with thread id ${proofRecord.threadId}`, { problemCode: core_1.PresentationProblemReportReason.Abandoned });
        }
        const proposalAttachment = proposalMessage
            ? new core_1.Attachment({
                data: {
                    json: core_1.JsonTransformer.toJSON((0, utils_1.createRequestFromPreview)({
                        attributes: (_a = proposalMessage.presentationProposal) === null || _a === void 0 ? void 0 : _a.attributes,
                        predicates: (_b = proposalMessage.presentationProposal) === null || _b === void 0 ? void 0 : _b.predicates,
                        name: indyProofRequest.name,
                        nonce: indyProofRequest.nonce,
                        version: indyProofRequest.nonce,
                    })),
                },
            })
            : undefined;
        const { attachment } = await this.indyProofFormat.acceptRequest(agentContext, {
            attachmentId: messages_1.INDY_PROOF_ATTACHMENT_ID,
            requestAttachment,
            proposalAttachment,
            proofFormats,
            proofRecord,
        });
        const message = new messages_1.V1PresentationMessage({
            comment,
            presentationAttachments: [attachment],
        });
        message.setThread({ threadId: proofRecord.threadId, parentThreadId: proofRecord.parentThreadId });
        await didCommMessageRepository.saveAgentMessage(agentContext, {
            agentMessage: message,
            associatedRecordId: proofRecord.id,
            role: core_1.DidCommMessageRole.Sender,
        });
        // Update record
        proofRecord.autoAcceptProof = autoAcceptProof !== null && autoAcceptProof !== void 0 ? autoAcceptProof : proofRecord.autoAcceptProof;
        await this.updateState(agentContext, proofRecord, core_1.ProofState.PresentationSent);
        return { message, proofRecord };
    }
    async getCredentialsForRequest(agentContext, { proofRecord, proofFormats }) {
        var _a, _b;
        if (proofFormats)
            this.assertOnlyIndyFormat(proofFormats);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        const requestMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1RequestPresentationMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        const proposalMessage = await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1ProposePresentationMessage,
            role: core_1.DidCommMessageRole.Sender,
        });
        const requestAttachment = requestMessage.getRequestAttachmentById(messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID);
        const indyProofRequest = requestMessage.indyProofRequest;
        if (!requestAttachment || !indyProofRequest) {
            throw new core_1.CredoError(`Missing indy attachment in request message for presentation with thread id ${proofRecord.threadId}`);
        }
        const proposalAttachment = proposalMessage
            ? new core_1.Attachment({
                data: {
                    json: core_1.JsonTransformer.toJSON((0, utils_1.createRequestFromPreview)({
                        attributes: (_a = proposalMessage.presentationProposal) === null || _a === void 0 ? void 0 : _a.attributes,
                        predicates: (_b = proposalMessage.presentationProposal) === null || _b === void 0 ? void 0 : _b.predicates,
                        name: indyProofRequest.name,
                        nonce: indyProofRequest.nonce,
                        version: indyProofRequest.nonce,
                    })),
                },
            })
            : undefined;
        const credentialForRequest = await this.indyProofFormat.getCredentialsForRequest(agentContext, {
            proofRecord,
            requestAttachment,
            proofFormats,
            proposalAttachment,
        });
        return {
            proofFormats: {
                indy: credentialForRequest,
            },
        };
    }
    async selectCredentialsForRequest(agentContext, { proofRecord, proofFormats, }) {
        var _a, _b;
        if (proofFormats)
            this.assertOnlyIndyFormat(proofFormats);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        const requestMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1RequestPresentationMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        const proposalMessage = await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1ProposePresentationMessage,
            role: core_1.DidCommMessageRole.Sender,
        });
        const requestAttachment = requestMessage.getRequestAttachmentById(messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID);
        const indyProofRequest = requestMessage.indyProofRequest;
        if (!requestAttachment || !indyProofRequest) {
            throw new core_1.CredoError(`Missing indy attachment in request message for presentation with thread id ${proofRecord.threadId}`);
        }
        const proposalAttachment = proposalMessage
            ? new core_1.Attachment({
                data: {
                    json: core_1.JsonTransformer.toJSON((0, utils_1.createRequestFromPreview)({
                        attributes: (_a = proposalMessage.presentationProposal) === null || _a === void 0 ? void 0 : _a.attributes,
                        predicates: (_b = proposalMessage.presentationProposal) === null || _b === void 0 ? void 0 : _b.predicates,
                        name: indyProofRequest.name,
                        nonce: indyProofRequest.nonce,
                        version: indyProofRequest.nonce,
                    })),
                },
            })
            : undefined;
        const selectedCredentials = await this.indyProofFormat.selectCredentialsForRequest(agentContext, {
            proofFormats,
            proofRecord,
            requestAttachment,
            proposalAttachment,
        });
        return {
            proofFormats: {
                indy: selectedCredentials,
            },
        };
    }
    async processPresentation(messageContext) {
        var _a;
        const { message: presentationMessage, connection, agentContext } = messageContext;
        agentContext.config.logger.debug(`Processing presentation with message id ${presentationMessage.id}`);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        // TODO: with this method, we should update the credential protocol to use the ConnectionApi, so it
        // only depends on the public api, rather than the internal API (this helps with breaking changes)
        const connectionService = agentContext.dependencyManager.resolve(core_1.ConnectionService);
        const proofRecord = await this.getByProperties(agentContext, {
            threadId: presentationMessage.threadId,
            role: core_1.ProofRole.Verifier,
        });
        const proposalMessage = await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1ProposePresentationMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        const requestMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1RequestPresentationMessage,
            role: core_1.DidCommMessageRole.Sender,
        });
        // Assert
        proofRecord.assertState(core_1.ProofState.RequestSent);
        proofRecord.assertProtocolVersion('v1');
        await connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
            lastReceivedMessage: proposalMessage,
            lastSentMessage: requestMessage,
            expectedConnectionId: proofRecord.connectionId,
        });
        // This makes sure that the sender of the incoming message is authorized to do so.
        if (!proofRecord.connectionId) {
            await connectionService.matchIncomingMessageToRequestMessageInOutOfBandExchange(messageContext, {
                expectedConnectionId: proofRecord.connectionId,
            });
            proofRecord.connectionId = connection === null || connection === void 0 ? void 0 : connection.id;
        }
        const presentationAttachment = presentationMessage.getPresentationAttachmentById(messages_1.INDY_PROOF_ATTACHMENT_ID);
        if (!presentationAttachment) {
            proofRecord.errorMessage = 'Missing indy proof attachment';
            await this.updateState(agentContext, proofRecord, core_1.ProofState.Abandoned);
            throw new errors_1.V1PresentationProblemReportError(proofRecord.errorMessage, {
                problemCode: core_1.PresentationProblemReportReason.Abandoned,
            });
        }
        const requestAttachment = requestMessage.getRequestAttachmentById(messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID);
        if (!requestAttachment) {
            proofRecord.errorMessage = 'Missing indy proof request attachment';
            await this.updateState(agentContext, proofRecord, core_1.ProofState.Abandoned);
            throw new errors_1.V1PresentationProblemReportError(proofRecord.errorMessage, {
                problemCode: core_1.PresentationProblemReportReason.Abandoned,
            });
        }
        await didCommMessageRepository.saveAgentMessage(agentContext, {
            agentMessage: presentationMessage,
            associatedRecordId: proofRecord.id,
            role: core_1.DidCommMessageRole.Receiver,
        });
        let isValid;
        try {
            isValid = await this.indyProofFormat.processPresentation(agentContext, {
                proofRecord,
                attachment: presentationAttachment,
                requestAttachment,
            });
        }
        catch (error) {
            proofRecord.errorMessage = (_a = error.message) !== null && _a !== void 0 ? _a : 'Error verifying proof on presentation';
            proofRecord.isVerified = false;
            await this.updateState(agentContext, proofRecord, core_1.ProofState.Abandoned);
            throw new errors_1.V1PresentationProblemReportError('Error verifying proof on presentation', {
                problemCode: core_1.PresentationProblemReportReason.Abandoned,
            });
        }
        if (!isValid) {
            proofRecord.errorMessage = 'Invalid proof';
            proofRecord.isVerified = false;
            await this.updateState(agentContext, proofRecord, core_1.ProofState.Abandoned);
            throw new errors_1.V1PresentationProblemReportError('Invalid proof', {
                problemCode: core_1.PresentationProblemReportReason.Abandoned,
            });
        }
        // Update record
        proofRecord.isVerified = isValid;
        await this.updateState(agentContext, proofRecord, core_1.ProofState.PresentationReceived);
        return proofRecord;
    }
    async acceptPresentation(agentContext, { proofRecord }) {
        agentContext.config.logger.debug(`Creating presentation ack for proof record with id ${proofRecord.id}`);
        // Assert
        proofRecord.assertProtocolVersion('v1');
        proofRecord.assertState(core_1.ProofState.PresentationReceived);
        // Create message
        const ackMessage = new messages_1.V1PresentationAckMessage({
            status: core_1.AckStatus.OK,
            threadId: proofRecord.threadId,
        });
        ackMessage.setThread({
            threadId: proofRecord.threadId,
            parentThreadId: proofRecord.parentThreadId,
        });
        // Update record
        await this.updateState(agentContext, proofRecord, core_1.ProofState.Done);
        return { message: ackMessage, proofRecord };
    }
    async processAck(messageContext) {
        const { message: presentationAckMessage, connection, agentContext } = messageContext;
        agentContext.config.logger.debug(`Processing presentation ack with message id ${presentationAckMessage.id}`);
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        // TODO: with this method, we should update the credential protocol to use the ConnectionApi, so it
        // only depends on the public api, rather than the internal API (this helps with breaking changes)
        const connectionService = agentContext.dependencyManager.resolve(core_1.ConnectionService);
        const proofRecord = await this.getByProperties(agentContext, {
            threadId: presentationAckMessage.threadId,
            role: core_1.ProofRole.Prover,
            connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
        });
        const lastReceivedMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1RequestPresentationMessage,
            role: core_1.DidCommMessageRole.Receiver,
        });
        const lastSentMessage = await didCommMessageRepository.getAgentMessage(agentContext, {
            associatedRecordId: proofRecord.id,
            messageClass: messages_1.V1PresentationMessage,
            role: core_1.DidCommMessageRole.Sender,
        });
        // Assert
        proofRecord.assertProtocolVersion('v1');
        proofRecord.assertState(core_1.ProofState.PresentationSent);
        await connectionService.assertConnectionOrOutOfBandExchange(messageContext, {
            lastReceivedMessage,
            lastSentMessage,
            expectedConnectionId: proofRecord.connectionId,
        });
        // Update record
        await this.updateState(agentContext, proofRecord, core_1.ProofState.Done);
        return proofRecord;
    }
    async createProblemReport(_agentContext, { proofRecord, description }) {
        const message = new V1PresentationProblemReportMessage_1.V1PresentationProblemReportMessage({
            description: {
                code: core_1.PresentationProblemReportReason.Abandoned,
                en: description,
            },
        });
        message.setThread({
            threadId: proofRecord.threadId,
            parentThreadId: proofRecord.parentThreadId,
        });
        return {
            proofRecord,
            message,
        };
    }
    async shouldAutoRespondToProposal(agentContext, options) {
        const { proofRecord, proposalMessage } = options;
        const proofsModuleConfig = agentContext.dependencyManager.resolve(core_1.ProofsModuleConfig);
        const autoAccept = (0, utils_1.composeProofAutoAccept)(proofRecord.autoAcceptProof, proofsModuleConfig.autoAcceptProofs);
        // Handle always / never cases
        if (autoAccept === core_1.AutoAcceptProof.Always)
            return true;
        if (autoAccept === core_1.AutoAcceptProof.Never)
            return false;
        // We are in the ContentApproved case. We need to make sure we've sent a request, and it matches the proposal
        const requestMessage = await this.findRequestMessage(agentContext, proofRecord.id);
        const requestAttachment = requestMessage === null || requestMessage === void 0 ? void 0 : requestMessage.getRequestAttachmentById(messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID);
        if (!requestAttachment)
            return false;
        const rfc0592Proposal = core_1.JsonTransformer.toJSON((0, utils_1.createRequestFromPreview)({
            name: 'Proof Request',
            nonce: await agentContext.wallet.generateNonce(),
            version: '1.0',
            attributes: proposalMessage.presentationProposal.attributes,
            predicates: proposalMessage.presentationProposal.predicates,
        }));
        return this.indyProofFormat.shouldAutoRespondToProposal(agentContext, {
            proofRecord,
            proposalAttachment: new core_1.Attachment({
                data: {
                    json: rfc0592Proposal,
                },
            }),
            requestAttachment,
        });
    }
    async shouldAutoRespondToRequest(agentContext, options) {
        const { proofRecord, requestMessage } = options;
        const proofsModuleConfig = agentContext.dependencyManager.resolve(core_1.ProofsModuleConfig);
        const autoAccept = (0, utils_1.composeProofAutoAccept)(proofRecord.autoAcceptProof, proofsModuleConfig.autoAcceptProofs);
        // Handle always / never cases
        if (autoAccept === core_1.AutoAcceptProof.Always)
            return true;
        if (autoAccept === core_1.AutoAcceptProof.Never)
            return false;
        const requestAttachment = requestMessage.getRequestAttachmentById(messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID);
        if (!requestAttachment)
            return false;
        // We are in the ContentApproved case. We need to make sure we've sent a proposal, and it matches the request
        const proposalMessage = await this.findProposalMessage(agentContext, proofRecord.id);
        if (!proposalMessage)
            return false;
        const rfc0592Proposal = (0, utils_1.createRequestFromPreview)({
            name: 'Proof Request',
            nonce: await agentContext.wallet.generateNonce(),
            version: '1.0',
            attributes: proposalMessage.presentationProposal.attributes,
            predicates: proposalMessage.presentationProposal.predicates,
        });
        return this.indyProofFormat.shouldAutoRespondToRequest(agentContext, {
            proofRecord,
            proposalAttachment: new core_1.Attachment({
                data: {
                    base64: core_1.JsonEncoder.toBase64(rfc0592Proposal),
                },
            }),
            requestAttachment,
        });
    }
    async shouldAutoRespondToPresentation(agentContext, options) {
        const { proofRecord, presentationMessage } = options;
        const proofsModuleConfig = agentContext.dependencyManager.resolve(core_1.ProofsModuleConfig);
        const autoAccept = (0, utils_1.composeProofAutoAccept)(proofRecord.autoAcceptProof, proofsModuleConfig.autoAcceptProofs);
        // Handle always / never cases
        if (autoAccept === core_1.AutoAcceptProof.Always)
            return true;
        if (autoAccept === core_1.AutoAcceptProof.Never)
            return false;
        const presentationAttachment = presentationMessage.getPresentationAttachmentById(messages_1.INDY_PROOF_ATTACHMENT_ID);
        if (!presentationAttachment)
            return false;
        // We are in the ContentApproved case. We need to make sure we've sent a request, and it matches the presentation
        const requestMessage = await this.findRequestMessage(agentContext, proofRecord.id);
        const requestAttachment = requestMessage === null || requestMessage === void 0 ? void 0 : requestMessage.getRequestAttachmentById(messages_1.INDY_PROOF_REQUEST_ATTACHMENT_ID);
        if (!requestAttachment)
            return false;
        // We are in the ContentApproved case. We need to make sure we've sent a proposal, and it matches the request
        const proposalMessage = await this.findProposalMessage(agentContext, proofRecord.id);
        const rfc0592Proposal = proposalMessage
            ? core_1.JsonTransformer.toJSON((0, utils_1.createRequestFromPreview)({
                name: 'Proof Request',
                nonce: await agentContext.wallet.generateNonce(),
                version: '1.0',
                attributes: proposalMessage.presentationProposal.attributes,
                predicates: proposalMessage.presentationProposal.predicates,
            }))
            : undefined;
        return this.indyProofFormat.shouldAutoRespondToPresentation(agentContext, {
            proofRecord,
            requestAttachment,
            presentationAttachment,
            proposalAttachment: new core_1.Attachment({
                data: {
                    json: rfc0592Proposal,
                },
            }),
        });
    }
    async findProposalMessage(agentContext, proofRecordId) {
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        return await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: proofRecordId,
            messageClass: messages_1.V1ProposePresentationMessage,
        });
    }
    async findRequestMessage(agentContext, proofRecordId) {
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        return await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: proofRecordId,
            messageClass: messages_1.V1RequestPresentationMessage,
        });
    }
    async findPresentationMessage(agentContext, proofRecordId) {
        const didCommMessageRepository = agentContext.dependencyManager.resolve(core_1.DidCommMessageRepository);
        return await didCommMessageRepository.findAgentMessage(agentContext, {
            associatedRecordId: proofRecordId,
            messageClass: messages_1.V1PresentationMessage,
        });
    }
    async getFormatData(agentContext, proofRecordId) {
        var _a, _b;
        // TODO: we could looking at fetching all record using a single query and then filtering based on the type of the message.
        const [proposalMessage, requestMessage, presentationMessage] = await Promise.all([
            this.findProposalMessage(agentContext, proofRecordId),
            this.findRequestMessage(agentContext, proofRecordId),
            this.findPresentationMessage(agentContext, proofRecordId),
        ]);
        let indyProposeProof = undefined;
        const indyRequestProof = (_a = requestMessage === null || requestMessage === void 0 ? void 0 : requestMessage.indyProofRequest) !== null && _a !== void 0 ? _a : undefined;
        const indyPresentProof = (_b = presentationMessage === null || presentationMessage === void 0 ? void 0 : presentationMessage.indyProof) !== null && _b !== void 0 ? _b : undefined;
        if (proposalMessage && indyRequestProof) {
            indyProposeProof = (0, utils_1.createRequestFromPreview)({
                name: indyRequestProof.name,
                version: indyRequestProof.version,
                nonce: indyRequestProof.nonce,
                attributes: proposalMessage.presentationProposal.attributes,
                predicates: proposalMessage.presentationProposal.predicates,
            });
        }
        else if (proposalMessage) {
            indyProposeProof = (0, utils_1.createRequestFromPreview)({
                name: 'Proof Request',
                version: '1.0',
                nonce: await agentContext.wallet.generateNonce(),
                attributes: proposalMessage.presentationProposal.attributes,
                predicates: proposalMessage.presentationProposal.predicates,
            });
        }
        return {
            proposal: proposalMessage
                ? {
                    indy: indyProposeProof,
                }
                : undefined,
            request: requestMessage
                ? {
                    indy: indyRequestProof,
                }
                : undefined,
            presentation: presentationMessage
                ? {
                    indy: indyPresentProof,
                }
                : undefined,
        };
    }
    assertOnlyIndyFormat(proofFormats) {
        const formatKeys = Object.keys(proofFormats);
        // It's fine to not have any formats in some cases, if indy is required the method that calls this should check for this
        if (formatKeys.length === 0)
            return;
        if (formatKeys.length !== 1 || !formatKeys.includes('indy')) {
            throw new core_1.CredoError('Only indy proof format is supported for present proof v1 protocol');
        }
    }
}
exports.V1ProofProtocol = V1ProofProtocol;
//# sourceMappingURL=V1ProofProtocol.js.map