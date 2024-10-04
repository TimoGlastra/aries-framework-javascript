import type { OpenId4VcSiopAcceptAuthorizationRequestOptions, OpenId4VcSiopResolvedAuthorizationRequest } from './OpenId4vcSiopHolderServiceOptions';
import type { AgentContext } from '@credo-ts/core';
import type { AuthorizationResponsePayload } from '@sphereon/did-auth-siop';
import { DifPresentationExchangeService } from '@credo-ts/core';
export declare class OpenId4VcSiopHolderService {
    private presentationExchangeService;
    constructor(presentationExchangeService: DifPresentationExchangeService);
    resolveAuthorizationRequest(agentContext: AgentContext, requestJwtOrUri: string): Promise<OpenId4VcSiopResolvedAuthorizationRequest>;
    acceptAuthorizationRequest(agentContext: AgentContext, options: OpenId4VcSiopAcceptAuthorizationRequestOptions): Promise<{
        serverResponse: {
            status: number;
            body: string | Record<string, unknown> | undefined;
        };
        submittedResponse: AuthorizationResponsePayload;
    }>;
    private getOpenIdProvider;
    private getOpenIdTokenIssuerFromVerifiablePresentation;
    private assertValidTokenIssuer;
    private encryptJarmResponse;
}
