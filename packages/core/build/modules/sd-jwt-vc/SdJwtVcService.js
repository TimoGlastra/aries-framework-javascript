"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.SdJwtVcService = void 0;
const decode_1 = require("@sd-jwt/decode");
const present_1 = require("@sd-jwt/present");
const sd_jwt_vc_1 = require("@sd-jwt/sd-jwt-vc");
const utils_1 = require("@sd-jwt/utils");
const tsyringe_1 = require("tsyringe");
const crypto_1 = require("../../crypto");
const error_1 = require("../../error");
const X509Service_1 = require("../../modules/x509/X509Service");
const utils_2 = require("../../utils");
const domain_1 = require("../../utils/domain");
const fetch_1 = require("../../utils/fetch");
const dids_1 = require("../dids");
const vc_1 = require("../vc");
const x509_1 = require("../x509");
const SdJwtVcError_1 = require("./SdJwtVcError");
const decodeSdJwtVc_1 = require("./decodeSdJwtVc");
const disclosureFrame_1 = require("./disclosureFrame");
const repository_1 = require("./repository");
/**
 * @internal
 */
let SdJwtVcService = class SdJwtVcService {
    constructor(sdJwtVcRepository) {
        this.sdJwtVcRepository = sdJwtVcRepository;
    }
    async sign(agentContext, options) {
        var _a;
        const { payload, disclosureFrame, hashingAlgorithm } = options;
        // default is sha-256
        if (hashingAlgorithm && hashingAlgorithm !== 'sha-256') {
            throw new SdJwtVcError_1.SdJwtVcError(`Unsupported hashing algorithm used: ${hashingAlgorithm}`);
        }
        const issuer = await this.extractKeyFromIssuer(agentContext, options.issuer);
        // holer binding is optional
        const holderBinding = options.holder
            ? await this.extractKeyFromHolderBinding(agentContext, options.holder)
            : undefined;
        const header = {
            alg: issuer.alg,
            typ: 'vc+sd-jwt',
            kid: issuer.kid,
            x5c: issuer.x5c,
        };
        const sdjwt = new sd_jwt_vc_1.SDJwtVcInstance(Object.assign(Object.assign({}, this.getBaseSdJwtConfig(agentContext)), { signer: this.signer(agentContext, issuer.key), hashAlg: 'sha-256', signAlg: issuer.alg }));
        if (!payload.vct || typeof payload.vct !== 'string') {
            throw new SdJwtVcError_1.SdJwtVcError("Missing required parameter 'vct'");
        }
        const compact = await sdjwt.issue(Object.assign(Object.assign({}, payload), { cnf: holderBinding === null || holderBinding === void 0 ? void 0 : holderBinding.cnf, iss: issuer.iss, iat: (0, utils_2.nowInSeconds)(), vct: payload.vct }), disclosureFrame, { header });
        const prettyClaims = (await sdjwt.getClaims(compact));
        const a = await sdjwt.decode(compact);
        const sdjwtPayload = (_a = a.jwt) === null || _a === void 0 ? void 0 : _a.payload;
        if (!sdjwtPayload) {
            throw new SdJwtVcError_1.SdJwtVcError('Invalid sd-jwt-vc state.');
        }
        return {
            compact,
            prettyClaims,
            header: header,
            payload: sdjwtPayload,
            claimFormat: vc_1.ClaimFormat.SdJwtVc,
            encoded: compact,
        };
    }
    fromCompact(compactSdJwtVc, typeMetadata) {
        return (0, decodeSdJwtVc_1.decodeSdJwtVc)(compactSdJwtVc, typeMetadata);
    }
    applyDisclosuresForPayload(compactSdJwtVc, requestedPayload) {
        var _a;
        const decoded = (0, decode_1.decodeSdJwtSync)(compactSdJwtVc, crypto_1.Hasher.hash);
        const presentationFrame = (_a = (0, disclosureFrame_1.buildDisclosureFrameForPayload)(requestedPayload)) !== null && _a !== void 0 ? _a : {};
        if (decoded.kbJwt) {
            throw new SdJwtVcError_1.SdJwtVcError('Cannot apply limit disclosure on an sd-jwt with key binding jwt');
        }
        const requiredDisclosures = (0, present_1.selectDisclosures)(decoded.jwt.payload, 
        // Map to sd-jwt disclosure format
        decoded.disclosures.map((d) => ({
            digest: d.digestSync({ alg: 'sha-256', hasher: crypto_1.Hasher.hash }),
            encoded: d.encode(),
            key: d.key,
            salt: d.salt,
            value: d.value,
        })), presentationFrame);
        const [jwt] = compactSdJwtVc.split('~');
        const sdJwt = `${jwt}~${requiredDisclosures.map((d) => d.encoded).join('~')}~`;
        const disclosedDecoded = (0, decodeSdJwtVc_1.decodeSdJwtVc)(sdJwt);
        return disclosedDecoded;
    }
    async present(agentContext, { compactSdJwtVc, presentationFrame, verifierMetadata }) {
        const sdjwt = new sd_jwt_vc_1.SDJwtVcInstance(this.getBaseSdJwtConfig(agentContext));
        const sdJwtVc = await sdjwt.decode(compactSdJwtVc);
        const holderBinding = this.parseHolderBindingFromCredential(sdJwtVc);
        if (!holderBinding && verifierMetadata) {
            throw new SdJwtVcError_1.SdJwtVcError("Verifier metadata provided, but credential has no 'cnf' claim to create a KB-JWT from");
        }
        const holder = holderBinding ? await this.extractKeyFromHolderBinding(agentContext, holderBinding) : undefined;
        sdjwt.config({
            kbSigner: holder ? this.signer(agentContext, holder.key) : undefined,
            kbSignAlg: holder === null || holder === void 0 ? void 0 : holder.alg,
        });
        const compactDerivedSdJwtVc = await sdjwt.present(compactSdJwtVc, presentationFrame, {
            kb: verifierMetadata
                ? {
                    payload: {
                        iat: verifierMetadata.issuedAt,
                        nonce: verifierMetadata.nonce,
                        aud: verifierMetadata.audience,
                    },
                }
                : undefined,
        });
        return compactDerivedSdJwtVc;
    }
    assertValidX5cJwtIssuer(agentContext, iss, leafCertificate) {
        var _a, _b;
        if (!iss.startsWith('https://') && !(iss.startsWith('http://') && agentContext.config.allowInsecureHttpUrls)) {
            throw new SdJwtVcError_1.SdJwtVcError('The X509 certificate issuer must be a HTTPS URI.');
        }
        if (!((_a = leafCertificate.sanUriNames) === null || _a === void 0 ? void 0 : _a.includes(iss)) && !((_b = leafCertificate.sanDnsNames) === null || _b === void 0 ? void 0 : _b.includes((0, domain_1.getDomainFromUrl)(iss)))) {
            throw new SdJwtVcError_1.SdJwtVcError(`The 'iss' claim in the payload does not match a 'SAN-URI' name and the domain extracted from the HTTPS URI does not match a 'SAN-DNS' name in the x5c certificate.`);
        }
    }
    async verify(agentContext, { compactSdJwtVc, keyBinding, requiredClaimKeys, fetchTypeMetadata, trustedCertificates }) {
        var _a;
        const sdjwt = new sd_jwt_vc_1.SDJwtVcInstance(Object.assign({}, this.getBaseSdJwtConfig(agentContext)));
        const verificationResult = {
            isValid: false,
        };
        let sdJwtVc;
        let _error = undefined;
        try {
            sdJwtVc = await sdjwt.decode(compactSdJwtVc);
            if (!sdJwtVc.jwt)
                throw new error_1.CredoError('Invalid sd-jwt-vc');
        }
        catch (error) {
            return {
                isValid: false,
                verification: verificationResult,
                error,
            };
        }
        const returnSdJwtVc = {
            payload: sdJwtVc.jwt.payload,
            header: sdJwtVc.jwt.header,
            compact: compactSdJwtVc,
            prettyClaims: await sdJwtVc.getClaims(decodeSdJwtVc_1.sdJwtVcHasher),
            claimFormat: vc_1.ClaimFormat.SdJwtVc,
            encoded: compactSdJwtVc,
        };
        try {
            const credentialIssuer = await this.parseIssuerFromCredential(agentContext, sdJwtVc, returnSdJwtVc, trustedCertificates);
            const issuer = await this.extractKeyFromIssuer(agentContext, credentialIssuer);
            const holderBinding = this.parseHolderBindingFromCredential(sdJwtVc);
            const holder = holderBinding ? await this.extractKeyFromHolderBinding(agentContext, holderBinding) : undefined;
            sdjwt.config({
                verifier: this.verifier(agentContext, issuer.key),
                kbVerifier: holder ? this.verifier(agentContext, holder.key) : undefined,
            });
            const requiredKeys = requiredClaimKeys ? [...requiredClaimKeys, 'vct'] : ['vct'];
            try {
                await sdjwt.verify(compactSdJwtVc, requiredKeys, keyBinding !== undefined);
                verificationResult.isSignatureValid = true;
                verificationResult.areRequiredClaimsIncluded = true;
                verificationResult.isStatusValid = true;
            }
            catch (error) {
                _error = error;
                verificationResult.isSignatureValid = false;
                verificationResult.areRequiredClaimsIncluded = false;
                verificationResult.isStatusValid = false;
            }
            try {
                crypto_1.JwtPayload.fromJson(returnSdJwtVc.payload).validate();
                verificationResult.isValidJwtPayload = true;
            }
            catch (error) {
                _error = error;
                verificationResult.isValidJwtPayload = false;
            }
            // If keyBinding is present, verify the key binding
            try {
                if (keyBinding) {
                    if (!sdJwtVc.kbJwt || !sdJwtVc.kbJwt.payload) {
                        throw new SdJwtVcError_1.SdJwtVcError('Keybinding is required for verification of the sd-jwt-vc');
                    }
                    // Assert `aud` and `nonce` claims
                    if (sdJwtVc.kbJwt.payload.aud !== keyBinding.audience) {
                        throw new SdJwtVcError_1.SdJwtVcError('The key binding JWT does not contain the expected audience');
                    }
                    if (sdJwtVc.kbJwt.payload.nonce !== keyBinding.nonce) {
                        throw new SdJwtVcError_1.SdJwtVcError('The key binding JWT does not contain the expected nonce');
                    }
                    verificationResult.isKeyBindingValid = true;
                    verificationResult.containsExpectedKeyBinding = true;
                    verificationResult.containsRequiredVcProperties = true;
                }
            }
            catch (error) {
                _error = error;
                verificationResult.isKeyBindingValid = false;
                verificationResult.containsExpectedKeyBinding = false;
                verificationResult.containsRequiredVcProperties = false;
            }
            try {
                const vct = (_a = returnSdJwtVc.payload) === null || _a === void 0 ? void 0 : _a.vct;
                if (fetchTypeMetadata && typeof vct === 'string' && vct.startsWith('https://')) {
                    // modify the uri based on https://www.ietf.org/archive/id/draft-ietf-oauth-sd-jwt-vc-04.html#section-6.3.1
                    const vctElements = vct.split('/');
                    vctElements.splice(3, 0, '.well-known/vct');
                    const vctUrl = vctElements.join('/');
                    const response = await agentContext.config.agentDependencies.fetch(vctUrl);
                    if (response.ok) {
                        const typeMetadata = await response.json();
                        returnSdJwtVc.typeMetadata = typeMetadata;
                    }
                }
            }
            catch (error) {
                // we allow vct without type metadata for now
            }
        }
        catch (error) {
            verificationResult.isValid = false;
            return {
                isValid: false,
                error,
                verification: verificationResult,
                sdJwtVc: returnSdJwtVc,
            };
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isValid: _ } = verificationResult, allVerifications = __rest(verificationResult, ["isValid"]);
        verificationResult.isValid = Object.values(allVerifications).every((verification) => verification === true);
        if (_error) {
            return {
                isValid: false,
                error: _error,
                sdJwtVc: returnSdJwtVc,
                verification: verificationResult,
            };
        }
        return {
            isValid: true,
            verification: verificationResult,
            sdJwtVc: returnSdJwtVc,
        };
    }
    async store(agentContext, compactSdJwtVc) {
        const sdJwtVcRecord = new repository_1.SdJwtVcRecord({
            compactSdJwtVc,
        });
        await this.sdJwtVcRepository.save(agentContext, sdJwtVcRecord);
        return sdJwtVcRecord;
    }
    async getById(agentContext, id) {
        return await this.sdJwtVcRepository.getById(agentContext, id);
    }
    async getAll(agentContext) {
        return await this.sdJwtVcRepository.getAll(agentContext);
    }
    async findByQuery(agentContext, query, queryOptions) {
        return await this.sdJwtVcRepository.findByQuery(agentContext, query, queryOptions);
    }
    async deleteById(agentContext, id) {
        await this.sdJwtVcRepository.deleteById(agentContext, id);
    }
    async update(agentContext, sdJwtVcRecord) {
        await this.sdJwtVcRepository.update(agentContext, sdJwtVcRecord);
    }
    async resolveDidUrl(agentContext, didUrl) {
        const didResolver = agentContext.dependencyManager.resolve(dids_1.DidResolverService);
        const didDocument = await didResolver.resolveDidDocument(agentContext, didUrl);
        return {
            verificationMethod: didDocument.dereferenceKey(didUrl, ['assertionMethod']),
            didDocument,
        };
    }
    /**
     * @todo validate the JWT header (alg)
     */
    signer(agentContext, key) {
        return async (input) => {
            const signedBuffer = await agentContext.wallet.sign({ key, data: utils_2.TypedArrayEncoder.fromString(input) });
            return (0, utils_1.uint8ArrayToBase64Url)(signedBuffer);
        };
    }
    /**
     * @todo validate the JWT header (alg)
     */
    verifier(agentContext, key) {
        return async (message, signatureBase64Url) => {
            if (!key) {
                throw new SdJwtVcError_1.SdJwtVcError('The public key used to verify the signature is missing');
            }
            return await agentContext.wallet.verify({
                signature: utils_2.TypedArrayEncoder.fromBase64(signatureBase64Url),
                key,
                data: utils_2.TypedArrayEncoder.fromString(message),
            });
        };
    }
    async extractKeyFromIssuer(agentContext, issuer) {
        if (issuer.method === 'did') {
            const parsedDid = (0, dids_1.parseDid)(issuer.didUrl);
            if (!parsedDid.fragment) {
                throw new SdJwtVcError_1.SdJwtVcError(`didUrl '${issuer.didUrl}' does not contain a '#'. Unable to derive key from did document`);
            }
            const { verificationMethod } = await this.resolveDidUrl(agentContext, issuer.didUrl);
            const key = (0, dids_1.getKeyFromVerificationMethod)(verificationMethod);
            const supportedSignatureAlgorithms = (0, crypto_1.getJwkFromKey)(key).supportedSignatureAlgorithms;
            if (supportedSignatureAlgorithms.length === 0) {
                throw new SdJwtVcError_1.SdJwtVcError(`No supported JWA signature algorithms found for key with keyType ${key.keyType}`);
            }
            const alg = supportedSignatureAlgorithms[0];
            return {
                alg,
                key,
                iss: parsedDid.did,
                kid: `#${parsedDid.fragment}`,
            };
        }
        if (issuer.method === 'x5c') {
            const leafCertificate = X509Service_1.X509Service.getLeafCertificate(agentContext, { certificateChain: issuer.x5c });
            const key = leafCertificate.publicKey;
            const supportedSignatureAlgorithms = (0, crypto_1.getJwkFromKey)(key).supportedSignatureAlgorithms;
            if (supportedSignatureAlgorithms.length === 0) {
                throw new SdJwtVcError_1.SdJwtVcError(`No supported JWA signature algorithms found for key with keyType ${key.keyType}`);
            }
            const alg = supportedSignatureAlgorithms[0];
            this.assertValidX5cJwtIssuer(agentContext, issuer.issuer, leafCertificate);
            return {
                key,
                iss: issuer.issuer,
                x5c: issuer.x5c,
                alg,
            };
        }
        throw new SdJwtVcError_1.SdJwtVcError("Unsupported credential issuer. Only 'did' and 'x5c' is supported at the moment.");
    }
    async parseIssuerFromCredential(agentContext, sdJwtVc, credoSdJwtVc, _trustedCertificates) {
        var _a, _b, _c, _d, _e, _f;
        const x509Config = agentContext.dependencyManager.resolve(x509_1.X509ModuleConfig);
        if (!((_a = sdJwtVc.jwt) === null || _a === void 0 ? void 0 : _a.payload)) {
            throw new SdJwtVcError_1.SdJwtVcError('Credential not exist');
        }
        if (!((_b = sdJwtVc.jwt) === null || _b === void 0 ? void 0 : _b.payload['iss'])) {
            throw new SdJwtVcError_1.SdJwtVcError('Credential does not contain an issuer');
        }
        const iss = sdJwtVc.jwt.payload['iss'];
        if ((_c = sdJwtVc.jwt.header) === null || _c === void 0 ? void 0 : _c.x5c) {
            if (!Array.isArray(sdJwtVc.jwt.header.x5c)) {
                throw new SdJwtVcError_1.SdJwtVcError('Invalid x5c header in credential. Not an array.');
            }
            if (sdJwtVc.jwt.header.x5c.length === 0) {
                throw new SdJwtVcError_1.SdJwtVcError('Invalid x5c header in credential. Empty array.');
            }
            if (sdJwtVc.jwt.header.x5c.some((x5c) => typeof x5c !== 'string')) {
                throw new SdJwtVcError_1.SdJwtVcError('Invalid x5c header in credential. Not an array of strings.');
            }
            let trustedCertificates = _trustedCertificates;
            const certificateChain = sdJwtVc.jwt.header.x5c.map((cert) => x509_1.X509Certificate.fromEncodedCertificate(cert));
            if (certificateChain && !trustedCertificates) {
                trustedCertificates =
                    (_e = (await ((_d = x509Config.getTrustedCertificatesForVerification) === null || _d === void 0 ? void 0 : _d.call(x509Config, agentContext, {
                        certificateChain,
                        verification: {
                            type: 'credential',
                            credential: credoSdJwtVc,
                        },
                    })))) !== null && _e !== void 0 ? _e : x509Config.trustedCertificates;
            }
            if (!trustedCertificates) {
                throw new SdJwtVcError_1.SdJwtVcError('No trusted certificates configured for X509 certificate chain validation. Issuer cannot be verified.');
            }
            await X509Service_1.X509Service.validateCertificateChain(agentContext, {
                certificateChain: sdJwtVc.jwt.header.x5c,
                trustedCertificates,
            });
            return {
                method: 'x5c',
                x5c: sdJwtVc.jwt.header.x5c,
                issuer: iss,
            };
        }
        if (iss.startsWith('did:')) {
            // If `did` is used, we require a relative KID to be present to identify
            // the key used by issuer to sign the sd-jwt-vc
            if (!((_f = sdJwtVc.jwt) === null || _f === void 0 ? void 0 : _f.header)) {
                throw new SdJwtVcError_1.SdJwtVcError('Credential does not contain a header');
            }
            if (!sdJwtVc.jwt.header['kid']) {
                throw new SdJwtVcError_1.SdJwtVcError('Credential does not contain a kid in the header');
            }
            const issuerKid = sdJwtVc.jwt.header['kid'];
            let didUrl;
            if (issuerKid.startsWith('#')) {
                didUrl = `${iss}${issuerKid}`;
            }
            else if (issuerKid.startsWith('did:')) {
                const didFromKid = (0, dids_1.parseDid)(issuerKid);
                if (didFromKid.did !== iss) {
                    throw new SdJwtVcError_1.SdJwtVcError(`kid in header is an absolute DID URL, but the did (${didFromKid.did}) does not match with the 'iss' did (${iss})`);
                }
                didUrl = issuerKid;
            }
            else {
                throw new SdJwtVcError_1.SdJwtVcError('Invalid issuer kid for did. Only absolute or relative (starting with #) did urls are supported.');
            }
            return {
                method: 'did',
                didUrl,
            };
        }
        throw new SdJwtVcError_1.SdJwtVcError("Unsupported 'iss' value. Only did is supported at the moment.");
    }
    parseHolderBindingFromCredential(sdJwtVc) {
        var _a, _b;
        if (!((_a = sdJwtVc.jwt) === null || _a === void 0 ? void 0 : _a.payload)) {
            throw new SdJwtVcError_1.SdJwtVcError('Credential not exist');
        }
        if (!((_b = sdJwtVc.jwt) === null || _b === void 0 ? void 0 : _b.payload['cnf'])) {
            return null;
        }
        const cnf = sdJwtVc.jwt.payload['cnf'];
        if (cnf.jwk) {
            return {
                method: 'jwk',
                jwk: cnf.jwk,
            };
        }
        else if (cnf.kid) {
            if (!cnf.kid.startsWith('did:') || !cnf.kid.includes('#')) {
                throw new SdJwtVcError_1.SdJwtVcError('Invalid holder kid for did. Only absolute KIDs for cnf are supported');
            }
            return {
                method: 'did',
                didUrl: cnf.kid,
            };
        }
        throw new SdJwtVcError_1.SdJwtVcError("Unsupported credential holder binding. Only 'did' and 'jwk' are supported at the moment.");
    }
    async extractKeyFromHolderBinding(agentContext, holder) {
        if (holder.method === 'did') {
            const parsedDid = (0, dids_1.parseDid)(holder.didUrl);
            if (!parsedDid.fragment) {
                throw new SdJwtVcError_1.SdJwtVcError(`didUrl '${holder.didUrl}' does not contain a '#'. Unable to derive key from did document`);
            }
            const { verificationMethod } = await this.resolveDidUrl(agentContext, holder.didUrl);
            const key = (0, dids_1.getKeyFromVerificationMethod)(verificationMethod);
            const supportedSignatureAlgorithms = (0, crypto_1.getJwkFromKey)(key).supportedSignatureAlgorithms;
            if (supportedSignatureAlgorithms.length === 0) {
                throw new SdJwtVcError_1.SdJwtVcError(`No supported JWA signature algorithms found for key with keyType ${key.keyType}`);
            }
            const alg = supportedSignatureAlgorithms[0];
            return {
                alg,
                key,
                cnf: {
                    // We need to include the whole didUrl here, otherwise the verifier
                    // won't know which did it is associated with
                    kid: holder.didUrl,
                },
            };
        }
        else if (holder.method === 'jwk') {
            const jwk = holder.jwk instanceof crypto_1.Jwk ? holder.jwk : (0, crypto_1.getJwkFromJson)(holder.jwk);
            const key = jwk.key;
            const alg = jwk.supportedSignatureAlgorithms[0];
            return {
                alg,
                key,
                cnf: {
                    jwk: jwk.toJson(),
                },
            };
        }
        throw new SdJwtVcError_1.SdJwtVcError("Unsupported credential holder binding. Only 'did' and 'jwk' are supported at the moment.");
    }
    getBaseSdJwtConfig(agentContext) {
        return {
            hasher: decodeSdJwtVc_1.sdJwtVcHasher,
            statusListFetcher: this.getStatusListFetcher(agentContext),
            saltGenerator: agentContext.wallet.generateNonce,
        };
    }
    getStatusListFetcher(agentContext) {
        return async (uri) => {
            const response = await (0, fetch_1.fetchWithTimeout)(agentContext.config.agentDependencies.fetch, uri);
            if (!response.ok) {
                throw new error_1.CredoError(`Received invalid response with status ${response.status} when fetching status list from ${uri}. ${await response.text()}`);
            }
            return await response.text();
        };
    }
};
exports.SdJwtVcService = SdJwtVcService;
exports.SdJwtVcService = SdJwtVcService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [repository_1.SdJwtVcRepository])
], SdJwtVcService);
//# sourceMappingURL=SdJwtVcService.js.map