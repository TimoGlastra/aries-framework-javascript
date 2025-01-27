import type { OpenId4VcIssuerX5c, OpenId4VcJwtIssuer, OpenId4VcJwtIssuerFederation } from './models';
import type { AgentContext, DidPurpose, EncodedX509Certificate, JwaSignatureAlgorithm, Key } from '@credo-ts/core';
import type { VerifyJwtCallback, JwtIssuerWithContext as VpJwtIssuerWithContext } from '@sphereon/did-auth-siop';
import type { CreateJwtCallback, DPoPJwtIssuerWithContext, JwtIssuer } from '@sphereon/oid4vc-common';
/**
 * Returns the JWA Signature Algorithms that are supported by the wallet.
 *
 * This is an approximation based on the supported key types of the wallet.
 * This is not 100% correct as a supporting a key type does not mean you support
 * all the algorithms for that key type. However, this needs refactoring of the wallet
 * that is planned for the 0.5.0 release.
 */
export declare function getSupportedJwaSignatureAlgorithms(agentContext: AgentContext): JwaSignatureAlgorithm[];
export declare function getKeyFromDid(agentContext: AgentContext, didUrl: string, allowedPurposes?: DidPurpose[]): Promise<Key>;
type VerifyJwtCallbackOptions = {
    federation?: {
        trustedEntityIds?: string[];
    };
    trustedCertificates?: EncodedX509Certificate[];
};
export declare function getVerifyJwtCallback(agentContext: AgentContext, options?: VerifyJwtCallbackOptions): VerifyJwtCallback;
export declare function getCreateJwtCallback(agentContext: AgentContext): CreateJwtCallback<DPoPJwtIssuerWithContext | VpJwtIssuerWithContext>;
export declare function openIdTokenIssuerToJwtIssuer(agentContext: AgentContext, openId4VcTokenIssuer: Exclude<OpenId4VcJwtIssuer, OpenId4VcIssuerX5c | OpenId4VcJwtIssuerFederation> | (OpenId4VcIssuerX5c & {
    issuer: string;
}) | (OpenId4VcJwtIssuerFederation & {
    entityId: string;
})): Promise<JwtIssuer>;
export declare function getProofTypeFromKey(agentContext: AgentContext, key: Key): string;
export declare function addSecondsToDate(date: Date, seconds: number): Date;
export declare function dateToSeconds(date: Date): number;
export {};
