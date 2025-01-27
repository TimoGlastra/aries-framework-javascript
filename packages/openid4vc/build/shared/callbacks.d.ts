import type { OpenId4VcIssuerRecord } from '../openid4vc-issuer/repository';
import type { ClientAuthenticationCallback, SignJwtCallback, VerifyJwtCallback } from '@animo-id/oauth2';
import type { AgentContext } from '@credo-ts/core';
export declare function getOid4vciJwtVerifyCallback(agentContext: AgentContext): VerifyJwtCallback;
export declare function getOid4vciJwtSignCallback(agentContext: AgentContext): SignJwtCallback;
export declare function getOid4vciCallbacks(agentContext: AgentContext): {
    hash: (data: Uint8Array, alg: import("@animo-id/oauth2").HashAlgorithm) => Uint8Array;
    generateRandom: (length: number) => Uint8Array;
    signJwt: SignJwtCallback;
    clientAuthentication: () => void;
    verifyJwt: VerifyJwtCallback;
    fetch: typeof fetch;
};
/**
 * Allows us to authenticate when making requests to an external
 * authorizatin server
 */
export declare function dynamicOid4vciClientAuthentication(agentContext: AgentContext, issuerRecord: OpenId4VcIssuerRecord): ClientAuthenticationCallback;
