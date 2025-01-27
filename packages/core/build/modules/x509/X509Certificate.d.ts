import type { X509CreateSelfSignedCertificateOptions } from './X509ServiceOptions';
import type { CredoWebCrypto } from '../../crypto/webcrypto';
import { Key } from '../../crypto/Key';
type ExtensionObjectIdentifier = string;
type SubjectAlternativeNameExtension = Array<{
    type: 'url' | 'dns';
    value: string;
}>;
type AuthorityKeyIdentifierExtension = {
    keyId: string;
};
type SubjectKeyIdentifierExtension = {
    keyId: string;
};
type KeyUsageExtension = {
    usage: number;
};
type ExtensionValues = SubjectAlternativeNameExtension | AuthorityKeyIdentifierExtension | SubjectKeyIdentifierExtension | KeyUsageExtension;
type Extension = Record<ExtensionObjectIdentifier, ExtensionValues>;
export type ExtensionInput = Array<Array<{
    type: 'dns' | 'url';
    value: string;
}>>;
export declare enum KeyUsage {
    DigitalSignature = 1,
    NonRepudiation = 2,
    KeyEncipherment = 4,
    DataEncipherment = 8,
    KeyAgreement = 16,
    KeyCertSign = 32,
    CrlSign = 64,
    EncipherOnly = 128,
    DecipherOnly = 256
}
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
    get authorityKeyIdentifier(): string | undefined;
    get subjectKeyIdentifier(): string | undefined;
    get keyUsage(): Array<KeyUsage>;
    static createSelfSigned({ key, extensions, notAfter, notBefore, name, includeAuthorityKeyIdentifier, }: X509CreateSelfSignedCertificateOptions, webCrypto: CredoWebCrypto): Promise<X509Certificate>;
    get subject(): string;
    verify({ verificationDate, publicKey }: {
        verificationDate: Date;
        publicKey?: Key;
    }, webCrypto: CredoWebCrypto): Promise<void>;
    getData(crypto?: CredoWebCrypto): Promise<{
        issuerName: string;
        subjectName: string;
        serialNumber: string;
        thumbprint: string;
        pem: string;
        notBefore: Date;
        notAfter: Date;
    }>;
    getIssuerNameField(field: string): string[];
    toString(format: 'asn' | 'pem' | 'hex' | 'base64' | 'text' | 'base64url'): string;
    equal(certificate: X509Certificate): boolean;
}
export {};
