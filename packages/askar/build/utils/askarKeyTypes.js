"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyTypesSupportedByAskar = exports.isKeyTypeSupportedByAskarForPurpose = exports.AskarKeyTypePurpose = void 0;
const core_1 = require("@credo-ts/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
var AskarKeyTypePurpose;
(function (AskarKeyTypePurpose) {
    AskarKeyTypePurpose["KeyManagement"] = "KeyManagement";
    AskarKeyTypePurpose["Signing"] = "Signing";
    AskarKeyTypePurpose["Encryption"] = "Encryption";
})(AskarKeyTypePurpose || (exports.AskarKeyTypePurpose = AskarKeyTypePurpose = {}));
const keyTypeToAskarAlg = {
    [core_1.KeyType.Ed25519]: {
        keyAlg: aries_askar_shared_1.KeyAlgs.Ed25519,
        purposes: [AskarKeyTypePurpose.KeyManagement, AskarKeyTypePurpose.Signing],
    },
    [core_1.KeyType.X25519]: {
        keyAlg: aries_askar_shared_1.KeyAlgs.X25519,
        purposes: [AskarKeyTypePurpose.KeyManagement, AskarKeyTypePurpose.Signing],
    },
    [core_1.KeyType.Bls12381g1]: {
        keyAlg: aries_askar_shared_1.KeyAlgs.Bls12381G1,
        purposes: [AskarKeyTypePurpose.KeyManagement],
    },
    [core_1.KeyType.Bls12381g2]: {
        keyAlg: aries_askar_shared_1.KeyAlgs.Bls12381G2,
        purposes: [AskarKeyTypePurpose.KeyManagement],
    },
    [core_1.KeyType.Bls12381g1g2]: {
        keyAlg: aries_askar_shared_1.KeyAlgs.Bls12381G1,
        purposes: [AskarKeyTypePurpose.KeyManagement],
    },
    [core_1.KeyType.P256]: {
        keyAlg: aries_askar_shared_1.KeyAlgs.EcSecp256r1,
        purposes: [AskarKeyTypePurpose.KeyManagement, AskarKeyTypePurpose.Signing, AskarKeyTypePurpose.Encryption],
    },
    [core_1.KeyType.K256]: {
        keyAlg: aries_askar_shared_1.KeyAlgs.EcSecp256k1,
        purposes: [AskarKeyTypePurpose.KeyManagement, AskarKeyTypePurpose.Signing],
    },
};
const isKeyTypeSupportedByAskarForPurpose = (keyType, purpose) => keyType in keyTypeToAskarAlg &&
    keyTypeToAskarAlg[keyType].purposes.includes(purpose);
exports.isKeyTypeSupportedByAskarForPurpose = isKeyTypeSupportedByAskarForPurpose;
exports.keyTypesSupportedByAskar = Object.keys(keyTypeToAskarAlg);
//# sourceMappingURL=askarKeyTypes.js.map