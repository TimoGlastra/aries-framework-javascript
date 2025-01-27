"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BbsModule = void 0;
const core_1 = require("@credo-ts/core");
const Bls12381g2SigningProvider_1 = require("./Bls12381g2SigningProvider");
const signature_suites_1 = require("./signature-suites");
class BbsModule {
    /**
     * Registers the dependencies of the bbs module on the dependency manager.
     */
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(core_1.AgentConfig)
            .logger.warn("The '@credo-ts/bbs-signatures' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @credo-ts packages.");
        // Signing providers.
        dependencyManager.registerSingleton(core_1.SigningProviderToken, Bls12381g2SigningProvider_1.Bls12381g2SigningProvider);
        // Signature suites.
        dependencyManager.registerInstance(core_1.SignatureSuiteToken, {
            suiteClass: signature_suites_1.BbsBlsSignature2020,
            proofType: 'BbsBlsSignature2020',
            verificationMethodTypes: [core_1.VERIFICATION_METHOD_TYPE_BLS12381G2_KEY_2020],
            keyTypes: [core_1.KeyType.Bls12381g2],
        });
        dependencyManager.registerInstance(core_1.SignatureSuiteToken, {
            suiteClass: signature_suites_1.BbsBlsSignatureProof2020,
            proofType: 'BbsBlsSignatureProof2020',
            verificationMethodTypes: [core_1.VERIFICATION_METHOD_TYPE_BLS12381G2_KEY_2020],
            keyTypes: [core_1.KeyType.Bls12381g2],
        });
    }
}
exports.BbsModule = BbsModule;
//# sourceMappingURL=BbsModule.js.map