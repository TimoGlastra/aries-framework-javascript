import { AgentContext } from '../../agent';
import { X509ModuleConfig } from './X509ModuleConfig';
import { X509CreateSelfSignedCertificateOptions, X509ValidateCertificateChainOptions } from './X509ServiceOptions';
/**
 * @public
 */
export declare class X509Api {
    private agentContext;
    private x509ModuleConfig;
    constructor(agentContext: AgentContext, x509ModuleConfig: X509ModuleConfig);
    /**
     * Adds a trusted certificate to the X509 Module Config.
     *
     * @param certificate
     */
    addTrustedCertificate(certificate: string): void;
    /**
     * Overwrites the trusted certificates in the X509 Module Config.
     *
     * @param certificate
     */
    setTrustedCertificates(certificates?: [string, ...string[]]): Promise<void>;
    /**
     * Creates a self-signed certificate.
     *
     * @param options X509CreateSelfSignedCertificateOptions
     */
    createSelfSignedCertificate(options: X509CreateSelfSignedCertificateOptions): Promise<import("./X509Certificate").X509Certificate>;
    /**
     * Validate a certificate chain.
     *
     * @param options X509ValidateCertificateChainOptions
     */
    validateCertificateChain(options: X509ValidateCertificateChainOptions): Promise<import("./X509Certificate").X509Certificate[]>;
}
