"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcqlService = void 0;
const dcql_1 = require("dcql");
const tsyringe_1 = require("tsyringe");
const mdoc_1 = require("../mdoc");
const sd_jwt_vc_1 = require("../sd-jwt-vc");
const disclosureFrame_1 = require("../sd-jwt-vc/disclosureFrame");
const vc_1 = require("../vc");
const DcqlError_1 = require("./DcqlError");
const utils_1 = require("./utils");
/**
 * @todo create a public api for using dif presentation exchange
 */
let DcqlService = class DcqlService {
    /**
     * Queries the wallet for credentials that match the given presentation definition. This only does an initial query based on the
     * schema of the input descriptors. It does not do any further filtering based on the constraints in the input descriptors.
     */
    async queryCredentialsForDcqlQuery(agentContext, dcqlQuery) {
        const w3cCredentialRepository = agentContext.dependencyManager.resolve(vc_1.W3cCredentialRepository);
        const formats = new Set(dcqlQuery.credentials.map((c) => c.format));
        for (const format of formats) {
            if (format !== 'vc+sd-jwt' && format !== 'jwt_vc_json' && format !== 'jwt_vc_json-ld' && format !== 'mso_mdoc') {
                throw new DcqlError_1.DcqlError(`Unsupported credential format ${format}.`);
            }
        }
        const allRecords = [];
        const w3cCredentialRecords = formats.has('jwt_vc_json') || formats.has('jwt_vc_json-ld')
            ? await w3cCredentialRepository.getAll(agentContext)
            : [];
        allRecords.push(...w3cCredentialRecords);
        // query the wallet ourselves first to avoid the need to query the pex library for all
        // credentials for every proof request
        const mdocDoctypes = dcqlQuery.credentials
            .filter((credentialQuery) => credentialQuery.format === 'mso_mdoc')
            .map((c) => { var _a; return (_a = c.meta) === null || _a === void 0 ? void 0 : _a.doctype_value; });
        const allMdocCredentialQueriesSpecifyDoctype = mdocDoctypes.every((doctype) => doctype);
        const mdocApi = this.getMdocApi(agentContext);
        if (allMdocCredentialQueriesSpecifyDoctype) {
            const mdocRecords = await mdocApi.findAllByQuery({
                $or: mdocDoctypes.map((docType) => ({
                    docType: docType,
                })),
            });
            allRecords.push(...mdocRecords);
        }
        else {
            const mdocRecords = await mdocApi.getAll();
            allRecords.push(...mdocRecords);
        }
        // query the wallet ourselves first to avoid the need to query the pex library for all
        // credentials for every proof request
        const sdJwtVctValues = dcqlQuery.credentials
            .filter((credentialQuery) => credentialQuery.format === 'vc+sd-jwt')
            .flatMap((c) => { var _a; return (_a = c.meta) === null || _a === void 0 ? void 0 : _a.vct_values; });
        const allSdJwtVcQueriesSpecifyDoctype = sdJwtVctValues.every((vct) => vct);
        const sdJwtVcApi = this.getSdJwtVcApi(agentContext);
        if (allSdJwtVcQueriesSpecifyDoctype) {
            const sdjwtVcRecords = await sdJwtVcApi.findAllByQuery({
                $or: sdJwtVctValues.map((vct) => ({
                    vct: vct,
                })),
            });
            allRecords.push(...sdjwtVcRecords);
        }
        else {
            const sdJwtVcRecords = await sdJwtVcApi.getAll();
            allRecords.push(...sdJwtVcRecords);
        }
        return allRecords;
    }
    async getCredentialsForRequest(agentContext, dcqlQuery) {
        const credentialRecords = await this.queryCredentialsForDcqlQuery(agentContext, dcqlQuery);
        const dcqlCredentials = credentialRecords.map((record) => {
            if (record.type === 'MdocRecord') {
                const mdoc = mdoc_1.Mdoc.fromBase64Url(record.base64Url);
                return {
                    credential_format: 'mso_mdoc',
                    doctype: record.getTags().docType,
                    namespaces: mdoc.issuerSignedNamespaces,
                };
            }
            else if (record.type === 'SdJwtVcRecord') {
                return {
                    credential_format: 'vc+sd-jwt',
                    vct: record.getTags().vct,
                    claims: this.getSdJwtVcApi(agentContext).fromCompact(record.compactSdJwtVc)
                        .prettyClaims,
                };
            }
            else {
                // TODO:
                throw new DcqlError_1.DcqlError('W3C credentials are not supported yet');
            }
        });
        const queryResult = dcql_1.DcqlQuery.query(dcql_1.DcqlQuery.parse(dcqlQuery), dcqlCredentials);
        const matchesWithRecord = Object.fromEntries(Object.entries(queryResult.credential_matches).map(([credential_query_id, result]) => {
            if (result.success) {
                if (result.output.credential_format === 'vc+sd-jwt') {
                    const sdJwtVcRecord = credentialRecords[result.input_credential_index];
                    const claims = agentContext.dependencyManager
                        .resolve(sd_jwt_vc_1.SdJwtVcService)
                        .applyDisclosuresForPayload(sdJwtVcRecord.compactSdJwtVc, result.output.claims);
                    return [
                        credential_query_id,
                        Object.assign(Object.assign({}, result), { output: Object.assign(Object.assign({}, result.output), { claims: claims.prettyClaims }), record: credentialRecords[result.input_credential_index] }),
                    ];
                }
                return [credential_query_id, Object.assign(Object.assign({}, result), { record: credentialRecords[result.input_credential_index] })];
            }
            else {
                return [credential_query_id, result];
            }
        }));
        return Object.assign(Object.assign({}, queryResult), { credential_matches: matchesWithRecord });
    }
    /**
     * Selects the credentials to use based on the output from `getCredentialsForRequest`
     * Use this method if you don't want to manually select the credentials yourself.
     */
    selectCredentialsForRequest(dcqlQueryResult) {
        if (!dcqlQueryResult.canBeSatisfied) {
            throw new DcqlError_1.DcqlError('Cannot select the credentials for the dcql query presentation if the request cannot be satisfied');
        }
        const credentials = {};
        if (dcqlQueryResult.credential_sets) {
            for (const credentialSet of dcqlQueryResult.credential_sets) {
                // undefined defaults to true
                if (credentialSet.required === false)
                    continue;
                const firstFullFillableOption = credentialSet.options.find((option) => option.every((credential_id) => dcqlQueryResult.credential_matches[credential_id].success));
                if (!firstFullFillableOption) {
                    throw new DcqlError_1.DcqlError('Invalid dcql query result. No option is fullfillable');
                }
                for (const credentialQueryId of firstFullFillableOption) {
                    const credential = dcqlQueryResult.credential_matches[credentialQueryId];
                    if (credential.success && credential.record.type === 'MdocRecord' && 'namespaces' in credential.output) {
                        credentials[credentialQueryId] = {
                            claimFormat: vc_1.ClaimFormat.MsoMdoc,
                            credentialRecord: credential.record,
                            disclosedPayload: credential.output.namespaces,
                        };
                    }
                    else if (credential.success &&
                        credential.record.type === 'SdJwtVcRecord' &&
                        'claims' in credential.output) {
                        credentials[credentialQueryId] = {
                            claimFormat: vc_1.ClaimFormat.SdJwtVc,
                            credentialRecord: credential.record,
                            disclosedPayload: credential.output.claims,
                        };
                    }
                    else {
                        throw new DcqlError_1.DcqlError('Invalid dcql query result. Cannot auto-select credentials');
                    }
                }
            }
        }
        else {
            for (const credentialQuery of dcqlQueryResult.credentials) {
                const credential = dcqlQueryResult.credential_matches[credentialQuery.id];
                if (credential.success && credential.record.type === 'MdocRecord' && 'namespaces' in credential.output) {
                    credentials[credentialQuery.id] = {
                        claimFormat: vc_1.ClaimFormat.MsoMdoc,
                        credentialRecord: credential.record,
                        disclosedPayload: credential.output.namespaces,
                    };
                }
                else if (credential.success && credential.record.type === 'SdJwtVcRecord' && 'claims' in credential.output) {
                    credentials[credentialQuery.id] = {
                        claimFormat: vc_1.ClaimFormat.SdJwtVc,
                        credentialRecord: credential.record,
                        disclosedPayload: credential.output.claims,
                    };
                }
                else {
                    throw new DcqlError_1.DcqlError('Invalid dcql query result. Cannot auto-select credentials');
                }
            }
        }
        return credentials;
    }
    validateDcqlQuery(dcqlQuery) {
        return dcql_1.DcqlQuery.parse(dcqlQuery);
    }
    async createPresentation(agentContext, options) {
        const { domain, challenge, openid4vp } = options;
        const dcqlPresentation = {};
        const vcPresentationsToCreate = (0, utils_1.dcqlGetPresentationsToCreate)(options.credentialQueryToCredential);
        for (const [credentialQueryId, presentationToCreate] of Object.entries(vcPresentationsToCreate)) {
            if (presentationToCreate.claimFormat === vc_1.ClaimFormat.MsoMdoc) {
                const mdocRecord = presentationToCreate.credentialRecord;
                if (!openid4vp) {
                    throw new DcqlError_1.DcqlError('Missing openid4vp options for creating MDOC presentation.');
                }
                if (!domain) {
                    throw new DcqlError_1.DcqlError('Missing domain property for creating MDOC presentation.');
                }
                const { deviceResponseBase64Url } = await mdoc_1.MdocDeviceResponse.createOpenId4VpDcqlDeviceResponse(agentContext, {
                    mdoc: mdoc_1.Mdoc.fromBase64Url(mdocRecord.base64Url),
                    docRequest: {
                        itemsRequestData: {
                            docType: mdocRecord.getTags().docType,
                            nameSpaces: Object.fromEntries(Object.entries(presentationToCreate.disclosedPayload).map(([key, value]) => {
                                return [key, Object.fromEntries(Object.entries(value).map(([key]) => [key, true]))];
                            })),
                        },
                    },
                    sessionTranscriptOptions: Object.assign(Object.assign({}, openid4vp), { clientId: domain, verifierGeneratedNonce: challenge }),
                });
                dcqlPresentation[credentialQueryId] = mdoc_1.MdocDeviceResponse.fromBase64Url(deviceResponseBase64Url);
            }
            else if (presentationToCreate.claimFormat === vc_1.ClaimFormat.SdJwtVc) {
                const presentationFrame = (0, disclosureFrame_1.buildDisclosureFrameForPayload)(presentationToCreate.disclosedPayload);
                if (!domain) {
                    throw new DcqlError_1.DcqlError('Missing domain property for creating SdJwtVc presentation.');
                }
                const sdJwtVcApi = this.getSdJwtVcApi(agentContext);
                const presentation = await sdJwtVcApi.present({
                    compactSdJwtVc: presentationToCreate.credentialRecord.compactSdJwtVc,
                    presentationFrame,
                    verifierMetadata: {
                        audience: domain,
                        nonce: challenge,
                        issuedAt: Math.floor(Date.now() / 1000),
                    },
                });
                dcqlPresentation[credentialQueryId] = sdJwtVcApi.fromCompact(presentation);
            }
            else {
                throw new DcqlError_1.DcqlError('W3c Presentation are not yet supported in combination with DCQL.');
            }
        }
        return dcqlPresentation;
    }
    getEncodedPresentations(dcqlPresentation) {
        return Object.fromEntries(Object.entries(dcqlPresentation).map(([key, value]) => [key, value.encoded]));
    }
    getSdJwtVcApi(agentContext) {
        return agentContext.dependencyManager.resolve(sd_jwt_vc_1.SdJwtVcApi);
    }
    getMdocApi(agentContext) {
        return agentContext.dependencyManager.resolve(mdoc_1.MdocApi);
    }
};
exports.DcqlService = DcqlService;
exports.DcqlService = DcqlService = __decorate([
    (0, tsyringe_1.injectable)()
], DcqlService);
//# sourceMappingURL=DcqlService.js.map