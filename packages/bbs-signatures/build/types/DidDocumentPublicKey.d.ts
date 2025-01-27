import type { PublicJsonWebKey } from './JsonWebKey';
/**
 * Interface for the public key definition entry in a DID Document.
 * @see https://w3c-ccg.github.io/did-spec/#public-keys
 */
export interface DidDocumentPublicKey {
    /**
     * Fully qualified identifier of this public key, e.g. did:example:entity.id#keys-1
     */
    readonly id: string;
    /**
     * The type of this public key, as defined in: https://w3c-ccg.github.io/ld-cryptosuite-registry/
     */
    readonly type: string;
    /**
     * The DID of the controller of this key.
     */
    readonly controller?: string;
    /**
     * The value of the public key in Base58 format. Only one value field will be present.
     */
    readonly publicKeyBase58?: string;
    /**
     * Public key in JWK format.
     * @see https://w3c-ccg.github.io/did-spec/#public-keys
     */
    readonly publicKeyJwk?: PublicJsonWebKey;
    /**
     * Public key in HEX format.
     * @see https://w3c-ccg.github.io/did-spec/#public-keys
     */
    readonly publicKeyHex?: string;
}
