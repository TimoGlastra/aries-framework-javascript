import type { CredoWebCrypto } from '../../crypto/webcrypto';
import { Key } from '../../crypto/Key';
type Extension = Record<string, undefined | Array<{
    type: string;
    value: string;
}>>;
export type ExtensionInput = Array<Array<{
    type: 'dns' | 'url';
    value: string;
}>>;
export type X509CertificateOptions = {
    publicKey: Key;
    privateKey?: Uint8Array;
    extensions?: Array<Extension>;
    rawCertificate: Uint8Array;
};
export declare class X509Certificate {
    publicKey: Key;
    privateKey?: Uint8Array;
    extensions?: Array<Extension>;
    readonly rawCertificate: Uint8Array;
    constructor(options: X509CertificateOptions);
    static fromRawCertificate(rawCertificate: Uint8Array): X509Certificate;
    static fromEncodedCertificate(encodedCertificate: string): X509Certificate;
    private static parseCertificate;
    private getMatchingExtensions;
    get sanDnsNames(): string[];
    get sanUriNames(): string[];
    static createSelfSigned({ key, extensions, notAfter, notBefore, name, }: {
        key: Key;
        extensions?: ExtensionInput;
        notBefore?: Date;
        notAfter?: Date;
        name?: string;
    }, webCrypto: CredoWebCrypto): Promise<X509Certificate>;
    get subject(): string;
    verify({ verificationDate, publicKey }: {
        verificationDate: Date;
        publicKey?: Key;
    }, webCrypto: CredoWebCrypto): Promise<void>;
    toString(format: 'asn' | 'pem' | 'hex' | 'base64' | 'text' | 'base64url'): string;
    equal(certificate: X509Certificate): boolean;
}
export {};
