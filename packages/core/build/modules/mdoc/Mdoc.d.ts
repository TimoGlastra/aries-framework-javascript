import type { MdocSignOptions, MdocNameSpaces, MdocVerifyOptions } from './MdocOptions';
import type { AgentContext } from '../../agent';
import type { Key } from '../../crypto';
import { JwaSignatureAlgorithm } from '../../crypto';
import { ClaimFormat } from '../vc';
/**
 * This class represents a IssuerSigned Mdoc Document,
 * which are the actual credentials being issued to holders.
 */
export declare class Mdoc {
    private issuerSignedDocument;
    base64Url: string;
    private constructor();
    /**
     * claim format is convenience method added to all credential instances
     */
    get claimFormat(): ClaimFormat.MsoMdoc;
    /**
     * Encoded is convenience method added to all credential instances
     */
    get encoded(): string;
    static fromBase64Url(mdocBase64Url: string, expectedDocType?: string): Mdoc;
    static fromIssuerSignedDocument(issuerSignedBase64Url: string, expectedDocType?: string): Mdoc;
    static fromDeviceSignedDocument(issuerSignedBase64Url: string, deviceSignedBase64Url: string, expectedDocType?: string): Mdoc;
    get docType(): string;
    /**
     * Get the device key to which the mdoc is bound
     */
    get deviceKey(): Key | null;
    get alg(): JwaSignatureAlgorithm;
    get validityInfo(): import("@animo-id/mdoc").ValidityInfo;
    get deviceSignedNamespaces(): MdocNameSpaces;
    get issuerSignedCertificateChain(): [Uint8Array, ...Uint8Array[]];
    get issuerSignedNamespaces(): MdocNameSpaces;
    static sign(agentContext: AgentContext, options: MdocSignOptions): Promise<Mdoc>;
    verify(agentContext: AgentContext, options?: MdocVerifyOptions): Promise<{
        isValid: true;
    } | {
        isValid: false;
        error: string;
    }>;
}
