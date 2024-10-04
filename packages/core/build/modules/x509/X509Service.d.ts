import type { X509ValidateCertificateChainOptions, X509CreateSelfSignedCertificateOptions, X509GetLefCertificateOptions, X509ParseCertificateOptions } from './X509ServiceOptions';
import { AgentContext } from '../../agent';
import { X509Certificate } from './X509Certificate';
export declare class X509Service {
    /**
     *
     * Validate a chain of X.509 certificates according to RFC 5280
     *
     * This function requires a list of base64 encoded certificates and, optionally, a certificate that should be found in the chain.
     * If no certificate is provided, it will just assume the leaf certificate
     *
     * The leaf certificate should be the 0th index and the root the last
     *
     * Additional validation:
     *   - Make sure atleast a single certificate is in the chain
     *   - Check whether a certificate in the chain matches with a trusted certificate
     */
    static validateCertificateChain(agentContext: AgentContext, { certificateChain, certificate, verificationDate, trustedCertificates, }: X509ValidateCertificateChainOptions): Promise<X509Certificate[]>;
    /**
     *
     * Parses a base64-encoded X.509 certificate into a {@link X509Certificate}
     *
     */
    static parseCertificate(_agentContext: AgentContext, { encodedCertificate }: X509ParseCertificateOptions): X509Certificate;
    static getLeafCertificate(_agentContext: AgentContext, { certificateChain }: X509GetLefCertificateOptions): X509Certificate;
    static createSelfSignedCertificate(agentContext: AgentContext, options: X509CreateSelfSignedCertificateOptions): Promise<X509Certificate>;
}
