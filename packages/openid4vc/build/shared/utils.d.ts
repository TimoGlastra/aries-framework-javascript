import type { OpenId4VcIssuerX5c, OpenId4VcJwtIssuer } from './models';
import type { AgentContext, JwaSignatureAlgorithm, Key } from '@credo-ts/core';
import type { JwtIssuerWithContext as VpJwtIssuerWithContext, VerifyJwtCallback } from '@sphereon/did-auth-siop';
import type { DPoPJwtIssuerWithContext, CreateJwtCallback, JwtIssuer } from '@sphereon/oid4vc-common';
import type { CredentialOfferPayloadV1_0_11, CredentialOfferPayloadV1_0_13 } from '@sphereon/oid4vci-common';
/**
 * Returns the JWA Signature Algorithms that are supported by the wallet.
 *
 * This is an approximation based on the supported key types of the wallet.
 * This is not 100% correct as a supporting a key type does not mean you support
 * all the algorithms for that key type. However, this needs refactoring of the wallet
 * that is planned for the 0.5.0 release.
 */
export declare function getSupportedJwaSignatureAlgorithms(agentContext: AgentContext): JwaSignatureAlgorithm[];
export declare function getVerifyJwtCallback(agentContext: AgentContext): VerifyJwtCallback;
export declare function getCreateJwtCallback(agentContext: AgentContext): CreateJwtCallback<DPoPJwtIssuerWithContext | VpJwtIssuerWithContext>;
export declare function openIdTokenIssuerToJwtIssuer(agentContext: AgentContext, openId4VcTokenIssuer: Exclude<OpenId4VcJwtIssuer, OpenId4VcIssuerX5c> | (OpenId4VcIssuerX5c & {
    issuer: string;
})): Promise<JwtIssuer>;
export declare function getProofTypeFromKey(agentContext: AgentContext, key: Key): string;
export declare const isCredentialOfferV1Draft13: (credentialOffer: CredentialOfferPayloadV1_0_11 | CredentialOfferPayloadV1_0_13) => credentialOffer is CredentialOfferPayloadV1_0_13;
