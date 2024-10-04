export declare enum JwkKty {
    OctetKeyPair = "OKP",
    EC = "EC",
    RSA = "RSA"
}
export interface JwkEc {
    readonly kty: JwkKty.EC;
    readonly crv: string;
    readonly d?: string;
    readonly x?: string;
    readonly y?: string;
    readonly kid?: string;
}
export interface JwkOctetKeyPair {
    readonly kty: JwkKty.OctetKeyPair;
    readonly crv: string;
    readonly d?: string;
    readonly x?: string;
    readonly y?: string;
    readonly kid?: string;
}
export interface JwkRsa {
    readonly kty: JwkKty.RSA;
    readonly e: string;
    readonly n: string;
}
export interface JwkRsaPrivate extends JwkRsa {
    readonly d: string;
    readonly p: string;
    readonly q: string;
    readonly dp: string;
    readonly dq: string;
    readonly qi: string;
}
export type JsonWebKey = JwkOctetKeyPair | JwkEc | JwkRsa | JwkRsaPrivate;
export type PublicJsonWebKey = JwkOctetKeyPair | JwkEc | JwkRsa;
