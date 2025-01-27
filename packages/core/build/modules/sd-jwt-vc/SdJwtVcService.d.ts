import type { SdJwtVcSignOptions, SdJwtVcPresentOptions, SdJwtVcVerifyOptions, SdJwtVcPayload, SdJwtVcHeader } from './SdJwtVcOptions';
import type { JwkJson } from '../../crypto';
import type { Query, QueryOptions } from '../../storage/StorageService';
import { AgentContext } from '../../agent';
import { JsonObject } from '../../types';
import { ClaimFormat } from '../vc';
import { SdJwtVcRecord, SdJwtVcRepository } from './repository';
import { SdJwtVcTypeMetadata } from './typeMetadata';
export interface SdJwtVc<Header extends SdJwtVcHeader = SdJwtVcHeader, Payload extends SdJwtVcPayload = SdJwtVcPayload> {
    /**
     * claim format is convenience method added to all credential instances
     */
    claimFormat: ClaimFormat.SdJwtVc;
    /**
     * encoded is convenience method added to all credential instances
     */
    encoded: string;
    compact: string;
    header: Header;
    payload: Payload;
    prettyClaims: Payload;
    typeMetadata?: SdJwtVcTypeMetadata;
}
export interface CnfPayload {
    jwk?: JwkJson;
    kid?: string;
}
export interface VerificationResult {
    isValid: boolean;
    isValidJwtPayload?: boolean;
    isSignatureValid?: boolean;
    isStatusValid?: boolean;
    isNotBeforeValid?: boolean;
    isExpiryTimeValid?: boolean;
    areRequiredClaimsIncluded?: boolean;
    isKeyBindingValid?: boolean;
    containsExpectedKeyBinding?: boolean;
    containsRequiredVcProperties?: boolean;
}
/**
 * @internal
 */
export declare class SdJwtVcService {
    private sdJwtVcRepository;
    constructor(sdJwtVcRepository: SdJwtVcRepository);
    sign<Payload extends SdJwtVcPayload>(agentContext: AgentContext, options: SdJwtVcSignOptions<Payload>): Promise<{
        compact: string;
        prettyClaims: Payload;
        header: {
            readonly alg: import("../../crypto").JwaSignatureAlgorithm;
            readonly typ: "vc+sd-jwt";
            readonly kid: string | undefined;
            readonly x5c: string[] | undefined;
        };
        payload: Payload;
        claimFormat: ClaimFormat.SdJwtVc;
        encoded: string;
    }>;
    fromCompact<Header extends SdJwtVcHeader = SdJwtVcHeader, Payload extends SdJwtVcPayload = SdJwtVcPayload>(compactSdJwtVc: string, typeMetadata?: SdJwtVcTypeMetadata): SdJwtVc<Header, Payload>;
    applyDisclosuresForPayload(compactSdJwtVc: string, requestedPayload: JsonObject): SdJwtVc;
    present<Payload extends SdJwtVcPayload = SdJwtVcPayload>(agentContext: AgentContext, { compactSdJwtVc, presentationFrame, verifierMetadata }: SdJwtVcPresentOptions<Payload>): Promise<string>;
    private assertValidX5cJwtIssuer;
    verify<Header extends SdJwtVcHeader = SdJwtVcHeader, Payload extends SdJwtVcPayload = SdJwtVcPayload>(agentContext: AgentContext, { compactSdJwtVc, keyBinding, requiredClaimKeys, fetchTypeMetadata, trustedCertificates }: SdJwtVcVerifyOptions): Promise<{
        isValid: true;
        verification: VerificationResult;
        sdJwtVc: SdJwtVc<Header, Payload>;
    } | {
        isValid: false;
        verification: VerificationResult;
        sdJwtVc?: SdJwtVc<Header, Payload>;
        error: Error;
    }>;
    store(agentContext: AgentContext, compactSdJwtVc: string): Promise<SdJwtVcRecord>;
    getById(agentContext: AgentContext, id: string): Promise<SdJwtVcRecord>;
    getAll(agentContext: AgentContext): Promise<Array<SdJwtVcRecord>>;
    findByQuery(agentContext: AgentContext, query: Query<SdJwtVcRecord>, queryOptions?: QueryOptions): Promise<Array<SdJwtVcRecord>>;
    deleteById(agentContext: AgentContext, id: string): Promise<void>;
    update(agentContext: AgentContext, sdJwtVcRecord: SdJwtVcRecord): Promise<void>;
    private resolveDidUrl;
    /**
     * @todo validate the JWT header (alg)
     */
    private signer;
    /**
     * @todo validate the JWT header (alg)
     */
    private verifier;
    private extractKeyFromIssuer;
    private parseIssuerFromCredential;
    private parseHolderBindingFromCredential;
    private extractKeyFromHolderBinding;
    private getBaseSdJwtConfig;
    private getStatusListFetcher;
}
