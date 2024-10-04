export interface X509ModuleConfigOptions {
    /**
     *
     * Array of trusted base64-encoded certificate strings in the DER-format.
     */
    trustedCertificates?: [string, ...string[]];
}
export declare class X509ModuleConfig {
    private options;
    constructor(options?: X509ModuleConfigOptions);
    get trustedCertificates(): [string, ...string[]] | undefined;
    setTrustedCertificates(trustedCertificates?: [string, ...string[]]): void;
    addTrustedCertificate(trustedCertificate: string): void;
}
