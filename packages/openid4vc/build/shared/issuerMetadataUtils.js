"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypesFromCredentialSupported = getTypesFromCredentialSupported;
exports.credentialConfigurationSupportedToCredentialSupported = credentialConfigurationSupportedToCredentialSupported;
exports.credentialSupportedToCredentialConfigurationSupported = credentialSupportedToCredentialConfigurationSupported;
exports.credentialsSupportedV13ToV11 = credentialsSupportedV13ToV11;
exports.credentialsSupportedV11ToV13 = credentialsSupportedV11ToV13;
exports.getOfferedCredentials = getOfferedCredentials;
const core_1 = require("@credo-ts/core");
const utils_1 = require("./utils");
/**
 * Get all `types` from a `CredentialSupported` object.
 *
 * Depending on the format, the types may be nested, or have different a different name/type
 */
function getTypesFromCredentialSupported(credentialSupported) {
    if (credentialSupported.format === 'jwt_vc_json-ld' ||
        credentialSupported.format === 'ldp_vc' ||
        credentialSupported.format === 'jwt_vc_json' ||
        credentialSupported.format === 'jwt_vc') {
        if (!credentialSupported.credential_definition || !Array.isArray(credentialSupported.credential_definition.type)) {
            throw Error(`Unable to extract types from credentials supported for format ${credentialSupported.format}. credential_definition.type is not defined`);
        }
        return credentialSupported.credential_definition.type;
    }
    else if (credentialSupported.format === 'vc+sd-jwt') {
        if (!credentialSupported.vct) {
            throw Error(`Unable to extract types from credentials supported for format ${credentialSupported.format}. vct is not defined`);
        }
        return credentialSupported.vct ? [credentialSupported.vct] : undefined;
    }
    throw Error(`Unable to extract types from credentials supported. Unknown format ${credentialSupported.format}`);
}
function credentialConfigurationSupportedToCredentialSupported(id, config) {
    var _a, _b, _c, _d;
    const baseConfig = {
        id,
        scope: config.scope,
        cryptographic_binding_methods_supported: config.cryptographic_binding_methods_supported,
        cryptographic_suites_supported: config.credential_signing_alg_values_supported,
        display: config.display,
        order: config.order,
    };
    if (config.format === 'jwt_vc_json' || config.format === 'jwt_vc') {
        return Object.assign(Object.assign({}, baseConfig), { format: config.format, credentialSubject: (_a = config.credential_definition) === null || _a === void 0 ? void 0 : _a.credentialSubject, types: (_c = (_b = config.credential_definition) === null || _b === void 0 ? void 0 : _b.type) !== null && _c !== void 0 ? _c : [] });
    }
    else if (config.format === 'ldp_vc' || config.format === 'jwt_vc_json-ld') {
        if (!((_d = config.credential_definition) === null || _d === void 0 ? void 0 : _d['@context'])) {
            throw new Error(`Unable to transform from draft 13 credential configuration to draft 11 credential supported for format ${config.format}. credential_definition.@context is not defined`);
        }
        return Object.assign(Object.assign({}, baseConfig), { format: config.format, '@context': config.credential_definition['@context'], credentialSubject: config.credential_definition.credentialSubject, types: config.credential_definition.type });
    }
    else if (config.format === 'vc+sd-jwt') {
        if (!config.vct) {
            throw new Error(`Unable to transform from draft 13 credential configuration to draft 11 credential supported for format ${config.format}. vct is not defined`);
        }
        return Object.assign(Object.assign({}, baseConfig), { format: config.format, vct: config.vct, claims: config.claims });
    }
    throw new core_1.CredoError(`Unsupported credential format ${config.format}`);
}
function credentialSupportedToCredentialConfigurationSupported(agentContext, credentialSupported) {
    var _a, _b;
    const supportedJwaSignatureAlgorithms = (0, utils_1.getSupportedJwaSignatureAlgorithms)(agentContext);
    // We assume the jwt proof_types_supported is the same as the cryptographic_suites_supported when converting from v11 to v13
    const proofSigningAlgValuesSupported = (_b = (_a = credentialSupported.cryptographic_suites_supported) === null || _a === void 0 ? void 0 : _a.filter((alg) => supportedJwaSignatureAlgorithms.includes(alg))) !== null && _b !== void 0 ? _b : supportedJwaSignatureAlgorithms;
    // proof_types_supported was not available in v11. We assume jwt proof type supported
    const proofTypesSupported = {
        jwt: {
            proof_signing_alg_values_supported: proofSigningAlgValuesSupported,
        },
    };
    const baseCredentialConfigurationSupported = {
        scope: credentialSupported.scope,
        cryptographic_binding_methods_supported: credentialSupported.cryptographic_binding_methods_supported,
        credential_signing_alg_values_supported: credentialSupported.cryptographic_suites_supported,
        // This is not necessarily true, but the best we can do for now
        proof_types_supported: proofTypesSupported,
        display: credentialSupported.display,
        order: credentialSupported.order,
    };
    if (credentialSupported.format === 'jwt_vc_json' || credentialSupported.format === 'jwt_vc') {
        return Object.assign(Object.assign({}, baseCredentialConfigurationSupported), { format: credentialSupported.format, credential_definition: {
                credentialSubject: credentialSupported.credentialSubject,
                type: credentialSupported.types,
            } });
    }
    else if (credentialSupported.format === 'ldp_vc' || credentialSupported.format === 'jwt_vc_json-ld') {
        return Object.assign(Object.assign({}, baseCredentialConfigurationSupported), { format: credentialSupported.format, credential_definition: {
                '@context': credentialSupported['@context'],
                credentialSubject: credentialSupported.credentialSubject,
                type: credentialSupported.types,
            } });
    }
    else if (credentialSupported.format === 'vc+sd-jwt') {
        return Object.assign(Object.assign({}, baseCredentialConfigurationSupported), { format: credentialSupported.format, vct: credentialSupported.vct, claims: credentialSupported.claims });
    }
    throw new core_1.CredoError(`Unsupported credential format ${credentialSupported.format}`);
}
function credentialsSupportedV13ToV11(credentialConfigurationSupported) {
    const credentialsSupportedWithId = [];
    for (const [id, credentialConfiguration] of Object.entries(credentialConfigurationSupported)) {
        credentialsSupportedWithId.push(credentialConfigurationSupportedToCredentialSupported(id, credentialConfiguration));
    }
    return credentialsSupportedWithId;
}
function credentialsSupportedV11ToV13(agentContext, credentialsSupported) {
    const credentialConfigurationsSupported = {};
    for (const credentialSupported of credentialsSupported) {
        credentialConfigurationsSupported[credentialSupported.id] = credentialSupportedToCredentialConfigurationSupported(agentContext, credentialSupported);
    }
    return credentialConfigurationsSupported;
}
/**
 * Returns all entries from the credential offer with the associated metadata resolved. For 'id' entries, the associated `credentials_supported` object is resolved from the issuer metadata.
 * For inline entries, an error is thrown.
 */
function getOfferedCredentials(agentContext, offeredCredentials, credentialsSupportedOrConfigurations) {
    const offeredCredentialConfigurations = {};
    const offeredCredentialsSupported = [];
    const credentialsSupported = Array.isArray(credentialsSupportedOrConfigurations)
        ? credentialsSupportedOrConfigurations.filter((s) => s.id !== undefined)
        : credentialsSupportedV13ToV11(credentialsSupportedOrConfigurations);
    const credentialConfigurationsSupported = Array.isArray(credentialsSupportedOrConfigurations)
        ? credentialsSupportedV11ToV13(agentContext, credentialsSupportedOrConfigurations.filter((s) => s.id !== undefined))
        : credentialsSupportedOrConfigurations;
    for (const offeredCredential of offeredCredentials) {
        // In draft 12 inline credential offers are removed. It's easier to already remove support now.
        if (typeof offeredCredential !== 'string') {
            throw new core_1.CredoError('Only referenced credentials pointing to an id in credentials_supported issuer metadata are supported');
        }
        const foundCredentialConfiguration = credentialConfigurationsSupported[offeredCredential];
        const foundCredentialSupported = credentialsSupported.find((supported) => supported.id === offeredCredential);
        // Make sure the issuer metadata includes the offered credential.
        if (!foundCredentialConfiguration || !foundCredentialSupported) {
            throw new Error(`Offered credential '${offeredCredential}' is not part of credentials_supported/credential_configurations_supported of the issuer metadata.`);
        }
        offeredCredentialConfigurations[offeredCredential] = foundCredentialConfiguration;
        offeredCredentialsSupported.push(foundCredentialSupported);
    }
    return {
        credentialConfigurationsSupported: offeredCredentialConfigurations,
        credentialsSupported: offeredCredentialsSupported,
    };
}
//# sourceMappingURL=issuerMetadataUtils.js.map