"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.x25519AlgorithmIdentifier = exports.ed25519AlgorithmIdentifier = exports.ecPublicKeyWithK256AlgorithmIdentifier = exports.ecPublicKeyWithP384AlgorithmIdentifier = exports.ecPublicKeyWithP256AlgorithmIdentifier = void 0;
const asn1_ecc_1 = require("@peculiar/asn1-ecc");
const asn1_schema_1 = require("@peculiar/asn1-schema");
const asn1_x509_1 = require("@peculiar/asn1-x509");
const ecPublicKeyAlgorithmIdentifier = (objectId) => new asn1_x509_1.AlgorithmIdentifier({
    algorithm: asn1_ecc_1.id_ecPublicKey,
    parameters: asn1_schema_1.AsnObjectIdentifierConverter.toASN(objectId).toBER(),
});
/**
 *
 * https://oid-rep.orange-labs.fr/get/1.2.840.10045.3.1.7
 *
 */
exports.ecPublicKeyWithP256AlgorithmIdentifier = ecPublicKeyAlgorithmIdentifier(asn1_ecc_1.id_secp256r1);
/**
 *
 * https://oid-rep.orange-labs.fr/get/1.3.132.0.34
 *
 */
exports.ecPublicKeyWithP384AlgorithmIdentifier = ecPublicKeyAlgorithmIdentifier(asn1_ecc_1.id_secp384r1);
/**
 *
 * https://oid-rep.orange-labs.fr/get/1.3.132.0.10
 *
 */
exports.ecPublicKeyWithK256AlgorithmIdentifier = ecPublicKeyAlgorithmIdentifier('1.3.132.0.10');
/**
 *
 * from: https://datatracker.ietf.org/doc/html/rfc8410#section-3
 *
 */
exports.ed25519AlgorithmIdentifier = new asn1_x509_1.AlgorithmIdentifier({ algorithm: '1.3.101.112' });
/**
 *
 * from: https://datatracker.ietf.org/doc/html/rfc8410#section-3
 *
 */
exports.x25519AlgorithmIdentifier = new asn1_x509_1.AlgorithmIdentifier({ algorithm: '1.3.101.110' });
//# sourceMappingURL=algorithmIdentifiers.js.map