import type { AgentContext } from '@credo-ts/core';
import type { AuthorizationResponsePayload } from '@sphereon/did-auth-siop';
import type { OpenId4VcSiopAcceptAuthorizationRequestOptions, OpenId4VcSiopFetchEntityConfigurationOptions, OpenId4VcSiopResolveAuthorizationRequestOptions, OpenId4VcSiopResolvedAuthorizationRequest, OpenId4VcSiopResolveTrustChainsOptions } from './OpenId4vcSiopHolderServiceOptions';
import { DcqlService, DifPresentationExchangeService } from '@credo-ts/core';
import { fetchEntityConfiguration as federationFetchEntityConfiguration } from '@openid-federation/core';
export declare class OpenId4VcSiopHolderService {
    private presentationExchangeService;
    private dcqlService;
    constructor(presentationExchangeService: DifPresentationExchangeService, dcqlService: DcqlService);
    resolveAuthorizationRequest(agentContext: AgentContext, requestJwtOrUri: string, options?: OpenId4VcSiopResolveAuthorizationRequestOptions): Promise<OpenId4VcSiopResolvedAuthorizationRequest>;
    acceptAuthorizationRequest(agentContext: AgentContext, options: OpenId4VcSiopAcceptAuthorizationRequestOptions): Promise<{
        readonly ok: false;
        readonly serverResponse: {
            readonly status: number;
            readonly body: string | Record<string, unknown> | null;
        };
        readonly submittedResponse: AuthorizationResponsePayload;
        readonly redirectUri?: undefined;
        readonly presentationDuringIssuanceSession?: undefined;
    } | {
        readonly ok: true;
        readonly serverResponse: {
            readonly status: number;
            readonly body: Record<string, unknown>;
        };
        readonly submittedResponse: AuthorizationResponsePayload;
        readonly redirectUri: string | undefined;
        readonly presentationDuringIssuanceSession: string | undefined;
    }>;
    private getOpenIdProvider;
    private getOpenIdTokenIssuerFromVerifiablePresentation;
    private assertValidTokenIssuer;
    private encryptJarmResponse;
    resolveOpenIdFederationChains(agentContext: AgentContext, options: OpenId4VcSiopResolveTrustChainsOptions): Promise<{
        chain: Awaited<ReturnType<typeof import("@openid-federation/core").fetchEntityStatementChain>>;
        leafEntityConfiguration: Awaited<ReturnType<typeof federationFetchEntityConfiguration>>;
        trustAnchorEntityConfiguration: Awaited<ReturnType<typeof federationFetchEntityConfiguration>>;
    }[]>;
    fetchOpenIdFederationEntityConfiguration(agentContext: AgentContext, options: OpenId4VcSiopFetchEntityConfigurationOptions): ReturnType<typeof federationFetchEntityConfiguration>;
}
