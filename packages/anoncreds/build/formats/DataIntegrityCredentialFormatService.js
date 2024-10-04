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
exports.DataIntegrityCredentialFormatService = void 0;
const core_1 = require("@credo-ts/core");
const repository_1 = require("../repository");
const services_1 = require("../services");
const utils_1 = require("../utils");
const credential_1 = require("../utils/credential");
const metadata_1 = require("../utils/metadata");
const w3cAnonCredsUtils_1 = require("../utils/w3cAnonCredsUtils");
const W3C_DATA_INTEGRITY_CREDENTIAL_OFFER = 'didcomm/w3c-di-vc-offer@v0.1';
const W3C_DATA_INTEGRITY_CREDENTIAL_REQUEST = 'didcomm/w3c-di-vc-request@v0.1';
const W3C_DATA_INTEGRITY_CREDENTIAL = 'didcomm/w3c-di-vc@v0.1';
class DataIntegrityCredentialFormatService {
    constructor() {
        /** formatKey is the key used when calling agent.credentials.xxx with credentialFormats.anoncreds */
        this.formatKey = 'dataIntegrity';
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
    async createProposal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    agentContext, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { credentialFormats, credentialRecord }) {
        throw new core_1.CredoError('Not defined');
    }
    async processProposal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    agentContext, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { attachment }) {
        throw new core_1.CredoError('Not defined');
    }
    async acceptProposal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    agentContext, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    input) {
        throw new core_1.CredoError('Not defined');
    }
    /**
     * Create a credential attachment format for a credential request.
     *
     * @param options The object containing all the options for the credential offer
     * @returns object containing associated attachment, formats and offersAttach elements
     *
     */
    async createOffer(agentContext, { credentialFormats, credentialRecord, attachmentId, }) {
        const dataIntegrityFormat = credentialFormats.dataIntegrity;
        if (!dataIntegrityFormat)
            throw new core_1.CredoError('Missing data integrity credential format data');
        const format = new core_1.CredentialFormatSpec({
            attachmentId: attachmentId,
            format: W3C_DATA_INTEGRITY_CREDENTIAL_OFFER,
        });
        const credential = dataIntegrityFormat.credential;
        if ('proof' in credential)
            throw new core_1.CredoError('The offered credential MUST NOT contain any proofs.');
        const { dataIntegrityCredentialOffer, previewAttributes } = await this.createDataIntegrityCredentialOffer(agentContext, credentialRecord, dataIntegrityFormat);
        const attachment = this.getFormatData(core_1.JsonTransformer.toJSON(dataIntegrityCredentialOffer), format.attachmentId);
        return { format, attachment, previewAttributes };
    }
    getCredentialVersion(credentialJson) {
        const context = credentialJson['@context'];
        if (!context || !Array.isArray(context))
            throw new core_1.CredoError('Invalid @context in credential offer');
        const isV1Credential = context.find((c) => c === 'https://www.w3.org/2018/credentials/v1');
        const isV2Credential = context.find((c) => c === 'https://www.w3.org/ns/credentials/v2');
        if (isV1Credential)
            return '1.1';
        else if (isV2Credential)
            throw new core_1.CredoError('Received w3c credential with unsupported version 2.0.');
        else
            throw new core_1.CredoError('Cannot determine credential version from @context');
    }
    async processOffer(agentContext, { attachment, credentialRecord }) {
        var _a, _b, _c;
        agentContext.config.logger.debug(`Processing data integrity credential offer for credential record ${credentialRecord.id}`);
        const dataIntegrityCredentialOffer = core_1.JsonTransformer.fromJSON(attachment.getDataAsJson(), core_1.DataIntegrityCredentialOffer);
        const credentialJson = dataIntegrityCredentialOffer.credential;
        const credentialVersion = this.getCredentialVersion(credentialJson);
        const credentialToBeValidated = Object.assign(Object.assign(Object.assign({}, credentialJson), { issuer: (_a = credentialJson.issuer) !== null && _a !== void 0 ? _a : 'https://example.com' }), (credentialVersion === '1.1'
            ? { issuanceDate: new Date().toISOString() }
            : { validFrom: new Date().toISOString() }));
        core_1.JsonTransformer.fromJSON(credentialToBeValidated, core_1.W3cCredential);
        const missingBindingMethod = dataIntegrityCredentialOffer.bindingRequired &&
            !((_b = dataIntegrityCredentialOffer.bindingMethod) === null || _b === void 0 ? void 0 : _b.anoncredsLinkSecret) &&
            !((_c = dataIntegrityCredentialOffer.bindingMethod) === null || _c === void 0 ? void 0 : _c.didcommSignedAttachment);
        if (missingBindingMethod) {
            throw new core_1.ProblemReportError('Invalid credential offer. Missing binding method.', {
                problemCode: core_1.CredentialProblemReportReason.IssuanceAbandoned,
            });
        }
    }
    async createSignedAttachment(agentContext, data, options, issuerSupportedAlgs) {
        const { alg, kid } = options;
        if (!kid.startsWith('did:')) {
            throw new core_1.CredoError(`kid '${kid}' is not a DID. Only dids are supported for kid`);
        }
        else if (!kid.includes('#')) {
            throw new core_1.CredoError(`kid '${kid}' does not contain a fragment. kid MUST point to a specific key in the did document.`);
        }
        const didsApi = agentContext.dependencyManager.resolve(core_1.DidsApi);
        const didDocument = await didsApi.resolveDidDocument(kid);
        const verificationMethod = didDocument.dereferenceKey(kid);
        const key = (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
        const jwk = (0, core_1.getJwkFromKey)(key);
        if (alg && !jwk.supportsSignatureAlgorithm(alg)) {
            throw new core_1.CredoError(`key type '${jwk.keyType}', does not support the JWS signature alg '${alg}'`);
        }
        const signingAlg = issuerSupportedAlgs.find((supportedAlg) => jwk.supportsSignatureAlgorithm(supportedAlg) && (alg === undefined || alg === supportedAlg));
        if (!signingAlg)
            throw new core_1.CredoError('No signing algorithm supported by the issuer found');
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        const jws = await jwsService.createJws(agentContext, {
            key,
            header: {},
            payload: new core_1.JwtPayload({ additionalClaims: { nonce: data.nonce } }),
            protectedHeaderOptions: { alg: signingAlg, kid },
        });
        const signedAttach = new core_1.Attachment({
            mimeType: 'application/json',
            data: new core_1.AttachmentData({ base64: jws.payload }),
        });
        signedAttach.addJws(jws);
        return signedAttach;
    }
    async getSignedAttachmentPayload(agentContext, signedAttachment) {
        const jws = signedAttachment.data.jws;
        if (!jws)
            throw new core_1.CredoError('Missing jws in signed attachment');
        if (!jws.protected)
            throw new core_1.CredoError('Missing protected header in signed attachment');
        if (!signedAttachment.data.base64)
            throw new core_1.CredoError('Missing payload in signed attachment');
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        const { isValid } = await jwsService.verifyJws(agentContext, {
            jws: {
                header: jws.header,
                protected: jws.protected,
                signature: jws.signature,
                payload: signedAttachment.data.base64,
            },
            jwkResolver: async ({ protectedHeader: { kid } }) => {
                if (!kid || typeof kid !== 'string')
                    throw new core_1.CredoError('Missing kid in protected header.');
                if (!kid.startsWith('did:'))
                    throw new core_1.CredoError('Only did is supported for kid identifier');
                const didsApi = agentContext.dependencyManager.resolve(core_1.DidsApi);
                const didDocument = await didsApi.resolveDidDocument(kid);
                const verificationMethod = didDocument.dereferenceKey(kid);
                const key = (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
                return (0, core_1.getJwkFromKey)(key);
            },
        });
        if (!isValid)
            throw new core_1.CredoError('Failed to validate signature of signed attachment');
        const payload = core_1.JsonEncoder.fromBase64(signedAttachment.data.base64);
        if (!payload.nonce || typeof payload.nonce !== 'string') {
            throw new core_1.CredoError('Invalid payload in signed attachment');
        }
        return payload;
    }
    async acceptOffer(agentContext, { credentialRecord, attachmentId, offerAttachment, credentialFormats, }) {
        var _a, _b, _c, _d, _e;
        const dataIntegrityFormat = credentialFormats === null || credentialFormats === void 0 ? void 0 : credentialFormats.dataIntegrity;
        const credentialOffer = core_1.JsonTransformer.fromJSON(offerAttachment.getDataAsJson(), core_1.DataIntegrityCredentialOffer);
        let anonCredsLinkSecretDataIntegrityBindingProof = undefined;
        const autoAcceptOfferWithAnonCredsLinkSecretMethod = credentialOffer.bindingRequired &&
            !(dataIntegrityFormat === null || dataIntegrityFormat === void 0 ? void 0 : dataIntegrityFormat.didCommSignedAttachment) &&
            ((_a = credentialOffer.bindingMethod) === null || _a === void 0 ? void 0 : _a.anoncredsLinkSecret);
        if ((dataIntegrityFormat === null || dataIntegrityFormat === void 0 ? void 0 : dataIntegrityFormat.anonCredsLinkSecret) || autoAcceptOfferWithAnonCredsLinkSecretMethod) {
            if (!((_b = credentialOffer.bindingMethod) === null || _b === void 0 ? void 0 : _b.anoncredsLinkSecret)) {
                throw new core_1.CredoError('Cannot request credential with a binding method that was not offered.');
            }
            const anonCredsHolderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
            const credentialDefinitionId = credentialOffer.bindingMethod.anoncredsLinkSecret.credentialDefinitionId;
            const credentialDefinitionReturn = await (0, utils_1.fetchCredentialDefinition)(agentContext, credentialDefinitionId);
            const { credentialRequest: anonCredsCredentialRequest, credentialRequestMetadata: anonCredsCredentialRequestMetadata, } = await anonCredsHolderService.createCredentialRequest(agentContext, {
                credentialOffer: {
                    schema_id: credentialDefinitionReturn.credentialDefinition.schemaId,
                    cred_def_id: credentialOffer.bindingMethod.anoncredsLinkSecret.credentialDefinitionId,
                    key_correctness_proof: credentialOffer.bindingMethod.anoncredsLinkSecret.keyCorrectnessProof,
                    nonce: credentialOffer.bindingMethod.anoncredsLinkSecret.nonce,
                },
                credentialDefinition: credentialDefinitionReturn.credentialDefinition,
                linkSecretId: (_c = dataIntegrityFormat === null || dataIntegrityFormat === void 0 ? void 0 : dataIntegrityFormat.anonCredsLinkSecret) === null || _c === void 0 ? void 0 : _c.linkSecretId,
            });
            if (!anonCredsCredentialRequest.entropy)
                throw new core_1.CredoError('Missing entropy for anonCredsCredentialRequest');
            anonCredsLinkSecretDataIntegrityBindingProof =
                anonCredsCredentialRequest;
            credentialRecord.metadata.set(metadata_1.AnonCredsCredentialMetadataKey, {
                credentialDefinitionId: credentialOffer.bindingMethod.anoncredsLinkSecret.credentialDefinitionId,
                schemaId: credentialDefinitionReturn.credentialDefinition.schemaId,
            });
            credentialRecord.metadata.set(metadata_1.AnonCredsCredentialRequestMetadataKey, anonCredsCredentialRequestMetadata);
        }
        let didCommSignedAttachmentBindingProof = undefined;
        let didCommSignedAttachment = undefined;
        if (dataIntegrityFormat === null || dataIntegrityFormat === void 0 ? void 0 : dataIntegrityFormat.didCommSignedAttachment) {
            if (!((_d = credentialOffer.bindingMethod) === null || _d === void 0 ? void 0 : _d.didcommSignedAttachment)) {
                throw new core_1.CredoError('Cannot request credential with a binding method that was not offered.');
            }
            didCommSignedAttachment = await this.createSignedAttachment(agentContext, { nonce: credentialOffer.bindingMethod.didcommSignedAttachment.nonce }, dataIntegrityFormat.didCommSignedAttachment, credentialOffer.bindingMethod.didcommSignedAttachment.algsSupported);
            didCommSignedAttachmentBindingProof = { attachment_id: didCommSignedAttachment.id };
        }
        const bindingProof = !anonCredsLinkSecretDataIntegrityBindingProof && !didCommSignedAttachmentBindingProof
            ? undefined
            : {
                anoncreds_link_secret: anonCredsLinkSecretDataIntegrityBindingProof,
                didcomm_signed_attachment: didCommSignedAttachmentBindingProof,
            };
        if (credentialOffer.bindingRequired && !bindingProof)
            throw new core_1.CredoError('Missing required binding proof');
        const dataModelVersion = (_e = dataIntegrityFormat === null || dataIntegrityFormat === void 0 ? void 0 : dataIntegrityFormat.dataModelVersion) !== null && _e !== void 0 ? _e : credentialOffer.dataModelVersionsSupported[0];
        if (!credentialOffer.dataModelVersionsSupported.includes(dataModelVersion)) {
            throw new core_1.CredoError('Cannot request credential with a data model version that was not offered.');
        }
        const credentialRequest = {
            data_model_version: dataModelVersion,
            binding_proof: bindingProof,
        };
        const format = new core_1.CredentialFormatSpec({
            attachmentId,
            format: W3C_DATA_INTEGRITY_CREDENTIAL_REQUEST,
        });
        const attachment = this.getFormatData(credentialRequest, format.attachmentId);
        return { format, attachment, appendAttachments: didCommSignedAttachment ? [didCommSignedAttachment] : undefined };
    }
    /**
     * Starting from a request is not supported for anoncreds credentials, this method only throws an error.
     */
    async createRequest() {
        throw new core_1.CredoError('Starting from a request is not supported for w3c credentials');
    }
    /**
     * We don't have any models to validate an anoncreds request object, for now this method does nothing
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async processRequest(agentContext, options) {
        // not needed for dataIntegrity
    }
    async createCredentialWithAnonCredsDataIntegrityProof(agentContext, input) {
        const { credentialRecord, anonCredsLinkSecretBindingMethod, anonCredsLinkSecretBindingProof, linkSecretMetadata, credentialSubjectId, } = input;
        const credentialAttributes = credentialRecord.credentialAttributes;
        if (!credentialAttributes) {
            throw new core_1.CredoError(`Missing required credential attribute values on credential record with id ${credentialRecord.id}`);
        }
        const credentialSubjectIdAttribute = credentialAttributes.find((ca) => ca.name === 'id');
        if (credentialSubjectId &&
            credentialSubjectIdAttribute &&
            credentialSubjectIdAttribute.value !== credentialSubjectId) {
            throw new core_1.CredoError('Invalid credential subject id.');
        }
        else if (!credentialSubjectIdAttribute && credentialSubjectId) {
            credentialAttributes.push(new core_1.CredentialPreviewAttribute({ name: 'id', value: credentialSubjectId }));
        }
        const anonCredsIssuerService = agentContext.dependencyManager.resolve(services_1.AnonCredsIssuerServiceSymbol);
        const credentialDefinition = (await agentContext.dependencyManager
            .resolve(repository_1.AnonCredsCredentialDefinitionRepository)
            .getByCredentialDefinitionId(agentContext, linkSecretMetadata.credentialDefinitionId)).credentialDefinition.value;
        // We check locally for credential definition info. If it supports revocation, we need to search locally for
        // an active revocation registry
        let revocationRegistryDefinitionId = undefined;
        let revocationRegistryIndex = undefined;
        let revocationStatusList = undefined;
        if (credentialDefinition.revocation) {
            const { credentialRevocationId, revocationRegistryId } = linkSecretMetadata;
            if (!credentialRevocationId || !revocationRegistryId) {
                throw new core_1.CredoError('Revocation registry definition id and revocation index are mandatory to issue AnonCreds revocable credentials');
            }
            revocationRegistryDefinitionId = revocationRegistryId;
            revocationRegistryIndex = Number(credentialRevocationId);
            const revocationRegistryDefinitionPrivateRecord = await agentContext.dependencyManager
                .resolve(repository_1.AnonCredsRevocationRegistryDefinitionPrivateRepository)
                .getByRevocationRegistryDefinitionId(agentContext, revocationRegistryDefinitionId);
            if (revocationRegistryDefinitionPrivateRecord.state !== repository_1.AnonCredsRevocationRegistryState.Active) {
                throw new core_1.CredoError(`Revocation registry ${revocationRegistryDefinitionId} is in ${revocationRegistryDefinitionPrivateRecord.state} state`);
            }
            const revocationStatusListResult = await (0, utils_1.fetchRevocationStatusList)(agentContext, revocationRegistryDefinitionId, (0, utils_1.dateToTimestamp)(new Date()));
            revocationStatusList = revocationStatusListResult.revocationStatusList;
        }
        const { credential } = await anonCredsIssuerService.createCredential(agentContext, {
            credentialOffer: {
                schema_id: linkSecretMetadata.schemaId,
                cred_def_id: anonCredsLinkSecretBindingMethod.credentialDefinitionId,
                key_correctness_proof: anonCredsLinkSecretBindingMethod.keyCorrectnessProof,
                nonce: anonCredsLinkSecretBindingMethod.nonce,
            },
            credentialRequest: anonCredsLinkSecretBindingProof,
            credentialValues: (0, credential_1.convertAttributesToCredentialValues)(credentialAttributes),
            revocationRegistryDefinitionId,
            revocationRegistryIndex,
            revocationStatusList,
        });
        const { credentialDefinition: anoncredsCredentialDefinition } = await (0, utils_1.fetchCredentialDefinition)(agentContext, credential.cred_def_id);
        const anonCredsHolderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
        return await anonCredsHolderService.legacyToW3cCredential(agentContext, {
            credential,
            issuerId: anoncredsCredentialDefinition.issuerId,
        });
    }
    async getSignatureMetadata(agentContext, offeredCredential, issuerVerificationMethod) {
        var _a, _b;
        const didsApi = agentContext.dependencyManager.resolve(core_1.DidsApi);
        const didDocument = await didsApi.resolveDidDocument(offeredCredential.issuerId);
        let verificationMethod;
        if (issuerVerificationMethod) {
            verificationMethod = didDocument.dereferenceKey(issuerVerificationMethod, ['authentication', 'assertionMethod']);
        }
        else {
            const vms = (_b = (_a = didDocument.authentication) !== null && _a !== void 0 ? _a : didDocument.assertionMethod) !== null && _b !== void 0 ? _b : didDocument.verificationMethod;
            if (!vms || vms.length === 0) {
                throw new core_1.CredoError('Missing authenticationMethod, assertionMethod, and verificationMethods in did document');
            }
            if (typeof vms[0] === 'string') {
                verificationMethod = didDocument.dereferenceVerificationMethod(vms[0]);
            }
            else {
                verificationMethod = vms[0];
            }
        }
        const signatureSuiteRegistry = agentContext.dependencyManager.resolve(core_1.SignatureSuiteRegistry);
        const signatureSuite = signatureSuiteRegistry.getByVerificationMethodType(verificationMethod.type);
        if (!signatureSuite) {
            throw new core_1.CredoError(`Could not find signature suite for verification method type ${verificationMethod.type}`);
        }
        return { verificationMethod, signatureSuite, offeredCredential };
    }
    async assertAndSetCredentialSubjectId(credential, credentialSubjectId) {
        if (!credentialSubjectId)
            return credential;
        if (Array.isArray(credential.credentialSubject)) {
            throw new core_1.CredoError('Invalid credential subject relation. Cannot determine the subject to be updated.');
        }
        const subjectId = credential.credentialSubject.id;
        if (subjectId && credentialSubjectId !== subjectId) {
            throw new core_1.CredoError('Invalid credential subject id.');
        }
        if (!subjectId)
            credential.credentialSubject.id = credentialSubjectId;
        return credential;
    }
    async signCredential(agentContext, credential, issuerVerificationMethod) {
        const { signatureSuite, verificationMethod } = await this.getSignatureMetadata(agentContext, credential, issuerVerificationMethod);
        const w3cCredentialService = agentContext.dependencyManager.resolve(core_1.W3cCredentialService);
        let credentialToBeSigned = credential;
        if (credential instanceof core_1.W3cJsonLdVerifiableCredential) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { proof } = credential, _credentialToBeSigned = __rest(credential, ["proof"]);
            credentialToBeSigned = _credentialToBeSigned;
        }
        const w3cJsonLdVerifiableCredential = (await w3cCredentialService.signCredential(agentContext, {
            format: core_1.ClaimFormat.LdpVc,
            credential: credentialToBeSigned,
            proofType: signatureSuite.proofType,
            verificationMethod: verificationMethod.id,
        }));
        if (Array.isArray(w3cJsonLdVerifiableCredential.proof)) {
            throw new core_1.CredoError('A newly signed credential can not have multiple proofs');
        }
        if (credential instanceof core_1.W3cJsonLdVerifiableCredential) {
            const combinedProofs = Array.isArray(credential.proof) ? credential.proof : [credential.proof];
            combinedProofs.push(w3cJsonLdVerifiableCredential.proof);
            w3cJsonLdVerifiableCredential.proof = combinedProofs;
        }
        return w3cJsonLdVerifiableCredential;
    }
    async acceptRequest(agentContext, { credentialFormats, credentialRecord, attachmentId, offerAttachment, requestAttachment, requestAppendAttachments, }) {
        var _a, _b, _c, _d, _e, _f;
        const dataIntegrityFormat = credentialFormats === null || credentialFormats === void 0 ? void 0 : credentialFormats.dataIntegrity;
        const credentialOffer = core_1.JsonTransformer.fromJSON(offerAttachment === null || offerAttachment === void 0 ? void 0 : offerAttachment.getDataAsJson(), core_1.DataIntegrityCredentialOffer);
        const assertedCredential = await this.assertAndSetCredentialSubjectId(core_1.JsonTransformer.fromJSON(credentialOffer.credential, core_1.W3cCredential), dataIntegrityFormat === null || dataIntegrityFormat === void 0 ? void 0 : dataIntegrityFormat.credentialSubjectId);
        const credentialRequest = requestAttachment.getDataAsJson();
        if (!credentialRequest)
            throw new core_1.CredoError('Missing data integrity credential request in createCredential');
        let signedCredential;
        if ((_a = credentialRequest.binding_proof) === null || _a === void 0 ? void 0 : _a.anoncreds_link_secret) {
            if (!((_b = credentialOffer.bindingMethod) === null || _b === void 0 ? void 0 : _b.anoncredsLinkSecret)) {
                throw new core_1.CredoError('Cannot issue credential with a binding method that was not offered');
            }
            const linkSecretMetadata = credentialRecord.metadata.get(metadata_1.AnonCredsCredentialMetadataKey);
            if (!linkSecretMetadata)
                throw new core_1.CredoError('Missing anoncreds link secret metadata');
            signedCredential = await this.createCredentialWithAnonCredsDataIntegrityProof(agentContext, {
                credentialRecord,
                anonCredsLinkSecretBindingMethod: credentialOffer.bindingMethod.anoncredsLinkSecret,
                linkSecretMetadata,
                anonCredsLinkSecretBindingProof: credentialRequest.binding_proof.anoncreds_link_secret,
                credentialSubjectId: dataIntegrityFormat === null || dataIntegrityFormat === void 0 ? void 0 : dataIntegrityFormat.credentialSubjectId,
            });
        }
        if ((_c = credentialRequest.binding_proof) === null || _c === void 0 ? void 0 : _c.didcomm_signed_attachment) {
            if (!((_d = credentialOffer.bindingMethod) === null || _d === void 0 ? void 0 : _d.didcommSignedAttachment)) {
                throw new core_1.CredoError('Cannot issue credential with a binding method that was not offered');
            }
            const bindingProofAttachment = requestAppendAttachments === null || requestAppendAttachments === void 0 ? void 0 : requestAppendAttachments.find((attachments) => { var _a, _b; return attachments.id === ((_b = (_a = credentialRequest.binding_proof) === null || _a === void 0 ? void 0 : _a.didcomm_signed_attachment) === null || _b === void 0 ? void 0 : _b.attachment_id); });
            if (!bindingProofAttachment)
                throw new core_1.CredoError('Missing binding proof attachment');
            const { nonce } = await this.getSignedAttachmentPayload(agentContext, bindingProofAttachment);
            if (nonce !== credentialOffer.bindingMethod.didcommSignedAttachment.nonce) {
                throw new core_1.CredoError('Invalid nonce in signed attachment');
            }
            signedCredential = await this.signCredential(agentContext, signedCredential !== null && signedCredential !== void 0 ? signedCredential : assertedCredential, dataIntegrityFormat === null || dataIntegrityFormat === void 0 ? void 0 : dataIntegrityFormat.issuerVerificationMethod);
        }
        if (!((_e = credentialRequest.binding_proof) === null || _e === void 0 ? void 0 : _e.anoncreds_link_secret) &&
            !((_f = credentialRequest.binding_proof) === null || _f === void 0 ? void 0 : _f.didcomm_signed_attachment)) {
            signedCredential = await this.signCredential(agentContext, assertedCredential);
        }
        const format = new core_1.CredentialFormatSpec({
            attachmentId,
            format: W3C_DATA_INTEGRITY_CREDENTIAL,
        });
        const attachment = this.getFormatData({ credential: core_1.JsonTransformer.toJSON(signedCredential) }, format.attachmentId);
        return { format, attachment };
    }
    async storeAnonCredsCredential(agentContext, credentialJson, credentialRecord, linkSecretRequestMetadata) {
        var _a;
        if (!credentialRecord.credentialAttributes) {
            throw new core_1.CredoError('Missing credential attributes on credential record. Unable to check credential attributes');
        }
        const anonCredsHolderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
        const legacyAnonCredsCredential = await anonCredsHolderService.w3cToLegacyCredential(agentContext, {
            credential: core_1.JsonTransformer.fromJSON(credentialJson, core_1.W3cJsonLdVerifiableCredential),
        });
        const { schema_id: schemaId, cred_def_id: credentialDefinitionId, rev_reg_id: revocationRegistryId, } = legacyAnonCredsCredential;
        const schemaReturn = await (0, utils_1.fetchSchema)(agentContext, schemaId);
        const credentialDefinitionReturn = await (0, utils_1.fetchCredentialDefinition)(agentContext, credentialDefinitionId);
        const revocationRegistryDefinitionReturn = revocationRegistryId
            ? await (0, utils_1.fetchRevocationRegistryDefinition)(agentContext, revocationRegistryId)
            : undefined;
        // This is required to process the credential
        const w3cJsonLdVerifiableCredential = await anonCredsHolderService.legacyToW3cCredential(agentContext, {
            credential: legacyAnonCredsCredential,
            issuerId: credentialJson.issuer,
            processOptions: {
                credentialRequestMetadata: linkSecretRequestMetadata,
                credentialDefinition: credentialDefinitionReturn.credentialDefinition,
                revocationRegistryDefinition: revocationRegistryDefinitionReturn === null || revocationRegistryDefinitionReturn === void 0 ? void 0 : revocationRegistryDefinitionReturn.revocationRegistryDefinition,
            },
        });
        const w3cCredentialRecordId = await anonCredsHolderService.storeCredential(agentContext, {
            credential: w3cJsonLdVerifiableCredential,
            schema: schemaReturn.schema,
            credentialDefinitionId,
            credentialDefinition: credentialDefinitionReturn.credentialDefinition,
            credentialRequestMetadata: linkSecretRequestMetadata,
            revocationRegistry: revocationRegistryDefinitionReturn
                ? {
                    id: revocationRegistryId,
                    definition: revocationRegistryDefinitionReturn === null || revocationRegistryDefinitionReturn === void 0 ? void 0 : revocationRegistryDefinitionReturn.revocationRegistryDefinition,
                }
                : undefined,
        });
        const w3cCredentialService = agentContext.dependencyManager.resolve(core_1.W3cCredentialService);
        const w3cCredentialRecord = await w3cCredentialService.getCredentialRecordById(agentContext, w3cCredentialRecordId);
        // If the credential is revocable, store the revocation identifiers in the credential record
        if (revocationRegistryId) {
            const linkSecretMetadata = credentialRecord.metadata.get(metadata_1.AnonCredsCredentialMetadataKey);
            if (!linkSecretMetadata)
                throw new core_1.CredoError('Missing link secret metadata');
            const anonCredsTags = await (0, w3cAnonCredsUtils_1.getAnonCredsTagsFromRecord)(w3cCredentialRecord);
            if (!anonCredsTags)
                throw new core_1.CredoError('Missing anoncreds tags on credential record.');
            linkSecretMetadata.revocationRegistryId = revocationRegistryDefinitionReturn === null || revocationRegistryDefinitionReturn === void 0 ? void 0 : revocationRegistryDefinitionReturn.revocationRegistryDefinitionId;
            linkSecretMetadata.credentialRevocationId = (_a = anonCredsTags.anonCredsCredentialRevocationId) === null || _a === void 0 ? void 0 : _a.toString();
            credentialRecord.metadata.set(metadata_1.AnonCredsCredentialMetadataKey, linkSecretMetadata);
        }
        return w3cCredentialRecord;
    }
    /**
     * Processes an incoming credential - retrieve metadata, retrieve payload and store it in wallet
     * @param options the issue credential message wrapped inside this object
     * @param credentialRecord the credential exchange record for this credential
     */
    async processCredential(agentContext, { credentialRecord, attachment, requestAttachment, offerAttachment }) {
        var _a, _b, _c;
        const credentialOffer = core_1.JsonTransformer.fromJSON(offerAttachment.getDataAsJson(), core_1.DataIntegrityCredentialOffer);
        const offeredCredentialJson = credentialOffer.credential;
        const credentialRequest = requestAttachment.getDataAsJson();
        if (!credentialRequest)
            throw new core_1.CredoError('Missing data integrity credential request in createCredential');
        if (!credentialRecord.credentialAttributes) {
            throw new core_1.CredoError('Missing credential attributes on credential record.');
        }
        const { credential: credentialJson } = attachment.getDataAsJson();
        if (Array.isArray(offeredCredentialJson.credentialSubject)) {
            throw new core_1.CredoError('Invalid credential subject. Multiple credential subjects are not yet supported.');
        }
        const credentialSubjectMatches = Object.entries(offeredCredentialJson.credentialSubject).every(([key, offeredValue]) => {
            const receivedValue = credentialJson.credentialSubject[key];
            if (!offeredValue || !receivedValue)
                return false;
            if (typeof offeredValue === 'number' || typeof receivedValue === 'number') {
                return offeredValue.toString() === receivedValue.toString();
            }
            return (0, core_1.deepEquality)(offeredValue, receivedValue);
        });
        if (!credentialSubjectMatches) {
            throw new core_1.CredoError('Received invalid credential. Received credential subject does not match the offered credential subject.');
        }
        const credentialVersion = this.getCredentialVersion(credentialJson);
        const expectedReceivedCredential = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, offeredCredentialJson), { '@context': credentialJson['@context'], issuer: (_a = offeredCredentialJson.issuer) !== null && _a !== void 0 ? _a : credentialJson.issuer, credentialSubject: credentialJson.credentialSubject }), (credentialVersion === '1.1' && { issuanceDate: credentialJson.issuanceDate })), (credentialVersion === '2.0' && { validFrom: credentialJson.validFrom })), (offeredCredentialJson.credentialStatus && { credentialStatus: credentialJson.credentialStatus })), { proof: credentialJson.proof });
        if (!(0, core_1.deepEquality)(credentialJson, expectedReceivedCredential)) {
            throw new core_1.CredoError('Received invalid credential. Received credential does not match the offered credential');
        }
        let w3cCredentialRecord;
        if ((_b = credentialRequest.binding_proof) === null || _b === void 0 ? void 0 : _b.anoncreds_link_secret) {
            const linkSecretRequestMetadata = credentialRecord.metadata.get(metadata_1.AnonCredsCredentialRequestMetadataKey);
            if (!linkSecretRequestMetadata) {
                throw new core_1.CredoError('Missing link secret request metadata');
            }
            const integrityProtectedFields = ['@context', 'issuer', 'type', 'credentialSubject', 'validFrom', 'issuanceDate'];
            if (Object.keys(offeredCredentialJson).some((key) => !integrityProtectedFields.includes(key) && key !== 'proof')) {
                throw new core_1.CredoError('Credential offer contains non anoncreds integrity protected fields.');
            }
            if (!Array.isArray(offeredCredentialJson.type) || (offeredCredentialJson === null || offeredCredentialJson === void 0 ? void 0 : offeredCredentialJson.type.length) !== 1) {
                throw new core_1.CredoError(`Invalid credential type. Only single credential type 'VerifiableCredential' is supported`);
            }
            w3cCredentialRecord = await this.storeAnonCredsCredential(agentContext, credentialJson, credentialRecord, linkSecretRequestMetadata);
            await this.assertCredentialAttributesMatchSchemaAttributes(agentContext, w3cCredentialRecord.credential, (_c = (0, w3cAnonCredsUtils_1.getAnonCredsTagsFromRecord)(w3cCredentialRecord)) === null || _c === void 0 ? void 0 : _c.anonCredsSchemaId, true);
        }
        else {
            const w3cCredentialService = agentContext.dependencyManager.resolve(core_1.W3cCredentialService);
            const w3cJsonLdVerifiableCredential = core_1.JsonTransformer.fromJSON(credentialJson, core_1.W3cJsonLdVerifiableCredential);
            w3cCredentialRecord = await w3cCredentialService.storeCredential(agentContext, {
                credential: w3cJsonLdVerifiableCredential,
            });
        }
        credentialRecord.credentials.push({
            credentialRecordType: this.credentialRecordType,
            credentialRecordId: w3cCredentialRecord.id,
        });
    }
    supportsFormat(format) {
        const supportedFormats = [
            W3C_DATA_INTEGRITY_CREDENTIAL_REQUEST,
            W3C_DATA_INTEGRITY_CREDENTIAL_OFFER,
            W3C_DATA_INTEGRITY_CREDENTIAL,
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
    async shouldAutoRespondToProposal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    agentContext, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { offerAttachment, proposalAttachment }) {
        throw new core_1.CredoError('Not implemented');
        return false;
    }
    async shouldAutoRespondToOffer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    agentContext, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { offerAttachment }) {
        const credentialOffer = core_1.JsonTransformer.fromJSON(offerAttachment.getDataAsJson(), core_1.DataIntegrityCredentialOffer);
        if (!credentialOffer.bindingRequired)
            return true;
        return false;
    }
    async shouldAutoRespondToRequest(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    agentContext, { offerAttachment, requestAttachment }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const credentialOffer = core_1.JsonTransformer.fromJSON(offerAttachment === null || offerAttachment === void 0 ? void 0 : offerAttachment.getDataAsJson(), core_1.DataIntegrityCredentialOffer);
        const credentialRequest = requestAttachment.getDataAsJson();
        if (!credentialOffer.bindingRequired &&
            !((_a = credentialRequest.binding_proof) === null || _a === void 0 ? void 0 : _a.anoncreds_link_secret) &&
            !((_b = credentialRequest.binding_proof) === null || _b === void 0 ? void 0 : _b.didcomm_signed_attachment)) {
            return true;
        }
        if (credentialOffer.bindingRequired &&
            !((_c = credentialRequest.binding_proof) === null || _c === void 0 ? void 0 : _c.anoncreds_link_secret) &&
            !((_d = credentialRequest.binding_proof) === null || _d === void 0 ? void 0 : _d.didcomm_signed_attachment)) {
            return false;
        }
        // cannot auto response credential subject id must be set manually
        if ((_e = credentialRequest.binding_proof) === null || _e === void 0 ? void 0 : _e.didcomm_signed_attachment) {
            try {
                const subjectJson = credentialOffer.credential.credentialSubject;
                const credentialSubject = core_1.JsonTransformer.fromJSON(subjectJson, core_1.W3cCredentialSubject);
                if (credentialSubject.id === undefined)
                    return false;
            }
            catch (e) {
                return false;
            }
        }
        const validLinkSecretRequest = !((_f = credentialRequest.binding_proof) === null || _f === void 0 ? void 0 : _f.anoncreds_link_secret) ||
            (((_g = credentialRequest.binding_proof) === null || _g === void 0 ? void 0 : _g.anoncreds_link_secret) && ((_h = credentialOffer.bindingMethod) === null || _h === void 0 ? void 0 : _h.anoncredsLinkSecret));
        const validDidCommSignedAttachmetRequest = !((_j = credentialRequest.binding_proof) === null || _j === void 0 ? void 0 : _j.didcomm_signed_attachment) ||
            (((_k = credentialRequest.binding_proof) === null || _k === void 0 ? void 0 : _k.didcomm_signed_attachment) &&
                ((_l = credentialOffer.bindingMethod) === null || _l === void 0 ? void 0 : _l.didcommSignedAttachment));
        return Boolean(validLinkSecretRequest && validDidCommSignedAttachmetRequest);
    }
    async shouldAutoRespondToCredential(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    agentContext, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { credentialRecord, requestAttachment, credentialAttachment }) {
        return true;
    }
    async createDataIntegrityCredentialOffer(agentContext, credentialRecord, options) {
        const { bindingRequired, credential, anonCredsLinkSecretBinding: anonCredsLinkSecretBindingMethodOptions, didCommSignedAttachmentBinding: didCommSignedAttachmentBindingMethodOptions, } = options;
        const dataModelVersionsSupported = ['1.1'];
        // validate the credential and get the preview attributes
        const credentialJson = credential instanceof core_1.W3cCredential ? core_1.JsonTransformer.toJSON(credential) : credential;
        const validW3cCredential = core_1.JsonTransformer.fromJSON(credentialJson, core_1.W3cCredential);
        const previewAttributes = this.previewAttributesFromCredential(validW3cCredential);
        let anonCredsLinkSecretBindingMethod = undefined;
        if (anonCredsLinkSecretBindingMethodOptions) {
            const { credentialDefinitionId, revocationRegistryDefinitionId, revocationRegistryIndex } = anonCredsLinkSecretBindingMethodOptions;
            const anoncredsCredentialOffer = await agentContext.dependencyManager
                .resolve(services_1.AnonCredsIssuerServiceSymbol)
                .createCredentialOffer(agentContext, { credentialDefinitionId });
            // We check locally for credential definition info. If it supports revocation, revocationRegistryIndex
            // and revocationRegistryDefinitionId are mandatory
            const { credentialDefinition } = await agentContext.dependencyManager
                .resolve(repository_1.AnonCredsCredentialDefinitionRepository)
                .getByCredentialDefinitionId(agentContext, anoncredsCredentialOffer.cred_def_id);
            if (credentialDefinition.value.revocation) {
                if (!revocationRegistryDefinitionId || !revocationRegistryIndex) {
                    throw new core_1.CredoError('AnonCreds revocable credentials require revocationRegistryDefinitionId and revocationRegistryIndex');
                }
                // Set revocation tags
                credentialRecord.setTags({
                    anonCredsRevocationRegistryId: revocationRegistryDefinitionId,
                    anonCredsCredentialRevocationId: revocationRegistryIndex.toString(),
                });
            }
            await this.assertCredentialAttributesMatchSchemaAttributes(agentContext, validW3cCredential, credentialDefinition.schemaId, false);
            anonCredsLinkSecretBindingMethod = {
                credentialDefinitionId: anoncredsCredentialOffer.cred_def_id,
                keyCorrectnessProof: anoncredsCredentialOffer.key_correctness_proof,
                nonce: anoncredsCredentialOffer.nonce,
            };
            credentialRecord.metadata.set(metadata_1.AnonCredsCredentialMetadataKey, {
                schemaId: anoncredsCredentialOffer.schema_id,
                credentialDefinitionId: credentialDefinitionId,
                credentialRevocationId: revocationRegistryIndex === null || revocationRegistryIndex === void 0 ? void 0 : revocationRegistryIndex.toString(),
                revocationRegistryId: revocationRegistryDefinitionId,
            });
        }
        let didCommSignedAttachmentBindingMethod = undefined;
        if (didCommSignedAttachmentBindingMethodOptions) {
            const { didMethodsSupported, algsSupported } = didCommSignedAttachmentBindingMethodOptions;
            didCommSignedAttachmentBindingMethod = {
                didMethodsSupported: didMethodsSupported !== null && didMethodsSupported !== void 0 ? didMethodsSupported : agentContext.dependencyManager.resolve(core_1.DidsApi).supportedResolverMethods,
                algsSupported: algsSupported !== null && algsSupported !== void 0 ? algsSupported : this.getSupportedJwaSignatureAlgorithms(agentContext),
                nonce: await agentContext.wallet.generateNonce(),
            };
            if (didCommSignedAttachmentBindingMethod.algsSupported.length === 0) {
                throw new core_1.CredoError('No supported JWA signature algorithms found.');
            }
            if (didCommSignedAttachmentBindingMethod.didMethodsSupported.length === 0) {
                throw new core_1.CredoError('No supported DID methods found.');
            }
        }
        if (bindingRequired && !anonCredsLinkSecretBindingMethod && !didCommSignedAttachmentBindingMethod) {
            throw new core_1.CredoError('Missing required binding method.');
        }
        const dataIntegrityCredentialOffer = new core_1.DataIntegrityCredentialOffer({
            dataModelVersionsSupported,
            bindingRequired: bindingRequired,
            bindingMethod: {
                anoncredsLinkSecret: anonCredsLinkSecretBindingMethod,
                didcommSignedAttachment: didCommSignedAttachmentBindingMethod,
            },
            credential: credentialJson,
        });
        return { dataIntegrityCredentialOffer, previewAttributes };
    }
    previewAttributesFromCredential(credential) {
        if (Array.isArray(credential.credentialSubject)) {
            throw new core_1.CredoError('Credential subject must be an object.');
        }
        const claims = Object.assign(Object.assign({}, credential.credentialSubject.claims), (credential.credentialSubject.id && { id: credential.credentialSubject.id }));
        const attributes = Object.entries(claims).map(([key, value]) => {
            return { name: key, value: value.toString() };
        });
        return attributes;
    }
    async assertCredentialAttributesMatchSchemaAttributes(agentContext, credential, schemaId, credentialSubjectIdMustBeSet) {
        const attributes = this.previewAttributesFromCredential(credential);
        const schemaReturn = await (0, utils_1.fetchSchema)(agentContext, schemaId);
        const enhancedAttributes = [...attributes];
        if (!credentialSubjectIdMustBeSet &&
            schemaReturn.schema.attrNames.includes('id') &&
            attributes.find((attr) => attr.name === 'id') === undefined)
            enhancedAttributes.push({ name: 'id', value: 'mock' });
        (0, credential_1.assertAttributesMatch)(schemaReturn.schema, enhancedAttributes);
        return { attributes };
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
    /**
     * Returns the JWA Signature Algorithms that are supported by the wallet.
     *
     * This is an approximation based on the supported key types of the wallet.
     * This is not 100% correct as a supporting a key type does not mean you support
     * all the algorithms for that key type. However, this needs refactoring of the wallet
     * that is planned for the 0.5.0 release.
     */
    getSupportedJwaSignatureAlgorithms(agentContext) {
        const supportedKeyTypes = agentContext.wallet.supportedKeyTypes;
        // Extract the supported JWS algs based on the key types the wallet support.
        const supportedJwaSignatureAlgorithms = supportedKeyTypes
            // Map the supported key types to the supported JWK class
            .map(core_1.getJwkClassFromKeyType)
            // Filter out the undefined values
            .filter((jwkClass) => jwkClass !== undefined)
            // Extract the supported JWA signature algorithms from the JWK class
            .flatMap((jwkClass) => jwkClass.supportedSignatureAlgorithms);
        return supportedJwaSignatureAlgorithms;
    }
}
exports.DataIntegrityCredentialFormatService = DataIntegrityCredentialFormatService;
//# sourceMappingURL=DataIntegrityCredentialFormatService.js.map