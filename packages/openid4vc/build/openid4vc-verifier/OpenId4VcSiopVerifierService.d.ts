import type { OpenId4VcSiopCreateAuthorizationRequestOptions, OpenId4VcSiopCreateAuthorizationRequestReturn, OpenId4VcSiopCreateVerifierOptions, OpenId4VcSiopVerifiedAuthorizationResponse, OpenId4VcSiopVerifyAuthorizationResponseOptions, ResponseMode } from './OpenId4VcSiopVerifierServiceOptions';
import type { OpenId4VcVerificationSessionRecord } from './repository';
import type { OpenId4VcSiopAuthorizationResponsePayload } from '../shared';
import type { AgentContext, DcqlQuery, DifPresentationExchangeDefinition, Query, QueryOptions } from '@credo-ts/core';
import type { ClientIdScheme } from '@sphereon/did-auth-siop';
import { Logger, W3cCredentialService } from '@credo-ts/core';
import { RP } from '@sphereon/did-auth-siop';
import { OpenId4VcVerifierModuleConfig } from './OpenId4VcVerifierModuleConfig';
import { OpenId4VcVerificationSessionRepository, OpenId4VcVerifierRecord, OpenId4VcVerifierRepository } from './repository';
/**
 * @internal
 */
export declare class OpenId4VcSiopVerifierService {
    private logger;
    private w3cCredentialService;
    private openId4VcVerifierRepository;
    private config;
    private openId4VcVerificationSessionRepository;
    constructor(logger: Logger, w3cCredentialService: W3cCredentialService, openId4VcVerifierRepository: OpenId4VcVerifierRepository, config: OpenId4VcVerifierModuleConfig, openId4VcVerificationSessionRepository: OpenId4VcVerificationSessionRepository);
    createAuthorizationRequest(agentContext: AgentContext, options: OpenId4VcSiopCreateAuthorizationRequestOptions & {
        verifier: OpenId4VcVerifierRecord;
    }): Promise<OpenId4VcSiopCreateAuthorizationRequestReturn>;
    verifyAuthorizationResponse(agentContext: AgentContext, options: OpenId4VcSiopVerifyAuthorizationResponseOptions & {
        verificationSession: OpenId4VcVerificationSessionRecord;
        jarmHeader?: {
            apu?: string;
            apv?: string;
        };
    }): Promise<OpenId4VcSiopVerifiedAuthorizationResponse & {
        verificationSession: OpenId4VcVerificationSessionRecord;
    }>;
    getVerifiedAuthorizationResponse(verificationSession: OpenId4VcVerificationSessionRecord): Promise<OpenId4VcSiopVerifiedAuthorizationResponse>;
    /**
     * Find the verification session associated with an authorization response. You can optionally provide a verifier id
     * if the verifier that the response is associated with is already known.
     */
    findVerificationSessionForAuthorizationResponse(agentContext: AgentContext, { authorizationResponse, authorizationResponseParams, verifierId, }: {
        authorizationResponse?: never;
        authorizationResponseParams: {
            state?: string;
            nonce?: string;
        };
        verifierId?: string;
    } | {
        authorizationResponse: OpenId4VcSiopAuthorizationResponsePayload;
        authorizationResponseParams?: never;
        verifierId?: string;
    }): Promise<OpenId4VcVerificationSessionRecord | null>;
    getAllVerifiers(agentContext: AgentContext): Promise<OpenId4VcVerifierRecord[]>;
    getVerifierByVerifierId(agentContext: AgentContext, verifierId: string): Promise<OpenId4VcVerifierRecord>;
    updateVerifier(agentContext: AgentContext, verifier: OpenId4VcVerifierRecord): Promise<void>;
    createVerifier(agentContext: AgentContext, options?: OpenId4VcSiopCreateVerifierOptions): Promise<OpenId4VcVerifierRecord>;
    findVerificationSessionsByQuery(agentContext: AgentContext, query: Query<OpenId4VcVerificationSessionRecord>, queryOptions?: QueryOptions): Promise<OpenId4VcVerificationSessionRecord[]>;
    getVerificationSessionById(agentContext: AgentContext, verificationSessionId: string): Promise<OpenId4VcVerificationSessionRecord>;
    getRelyingParty(agentContext: AgentContext, verifier: OpenId4VcVerifierRecord, { idToken, presentationDefinition, dcqlQuery, clientId, clientIdScheme, authorizationResponseUrl, responseMode, }: {
        responseMode?: ResponseMode;
        idToken?: boolean;
        presentationDefinition?: DifPresentationExchangeDefinition;
        dcqlQuery?: DcqlQuery;
        clientId: string;
        authorizationResponseUrl: string;
        clientIdScheme?: ClientIdScheme;
    }): Promise<RP>;
    private getPresentationVerificationCallback;
}
