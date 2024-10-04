import type { OpenId4VcSiopCreateAuthorizationRequestOptions, OpenId4VcSiopVerifyAuthorizationResponseOptions, OpenId4VcSiopCreateAuthorizationRequestReturn, OpenId4VcSiopCreateVerifierOptions } from './OpenId4VcSiopVerifierServiceOptions';
import type { OpenId4VcVerificationSessionRecord } from './repository';
import type { OpenId4VcSiopAuthorizationResponsePayload } from '../shared';
import type { Query, QueryOptions } from '@credo-ts/core';
import { AgentContext } from '@credo-ts/core';
import { OpenId4VcSiopVerifierService } from './OpenId4VcSiopVerifierService';
import { OpenId4VcVerifierModuleConfig } from './OpenId4VcVerifierModuleConfig';
/**
 * @public
 */
export declare class OpenId4VcVerifierApi {
    readonly config: OpenId4VcVerifierModuleConfig;
    private agentContext;
    private openId4VcSiopVerifierService;
    constructor(config: OpenId4VcVerifierModuleConfig, agentContext: AgentContext, openId4VcSiopVerifierService: OpenId4VcSiopVerifierService);
    /**
     * Retrieve all verifier records from storage
     */
    getAllVerifiers(): Promise<import("./repository").OpenId4VcVerifierRecord[]>;
    /**
     * Retrieve a verifier record from storage by its verified id
     */
    getVerifierByVerifierId(verifierId: string): Promise<import("./repository").OpenId4VcVerifierRecord>;
    /**
     * Create a new verifier and store the new verifier record.
     */
    createVerifier(options?: OpenId4VcSiopCreateVerifierOptions): Promise<import("./repository").OpenId4VcVerifierRecord>;
    findVerificationSessionsByQuery(query: Query<OpenId4VcVerificationSessionRecord>, queryOptions?: QueryOptions): Promise<OpenId4VcVerificationSessionRecord[]>;
    getVerificationSessionById(verificationSessionId: string): Promise<OpenId4VcVerificationSessionRecord>;
    /**
     * Create an authorization request, acting as a Relying Party (RP).
     *
     * Currently two types of requests are supported:
     *  - SIOP Self-Issued ID Token request: request to a Self-Issued OP from an RP
     *  - SIOP Verifiable Presentation Request: request to a Self-Issued OP from an RP, requesting a Verifiable Presentation using OpenID4VP
     *
     * Other flows (non-SIOP) are not supported at the moment, but can be added in the future.
     *
     * See {@link OpenId4VcSiopCreateAuthorizationRequestOptions} for detailed documentation on the options.
     */
    createAuthorizationRequest({ verifierId, ...otherOptions }: OpenId4VcSiopCreateAuthorizationRequestOptions & {
        verifierId: string;
    }): Promise<OpenId4VcSiopCreateAuthorizationRequestReturn>;
    /**
     * Verifies an authorization response, acting as a Relying Party (RP).
     *
     * It validates the ID Token, VP Token and the signature(s) of the received Verifiable Presentation(s)
     * as well as that the structure of the Verifiable Presentation matches the provided presentation definition.
     */
    verifyAuthorizationResponse({ verificationSessionId, ...otherOptions }: OpenId4VcSiopVerifyAuthorizationResponseOptions & {
        verificationSessionId: string;
    }): Promise<import("./OpenId4VcSiopVerifierServiceOptions").OpenId4VcSiopVerifiedAuthorizationResponse & {
        verificationSession: OpenId4VcVerificationSessionRecord;
    }>;
    getVerifiedAuthorizationResponse(verificationSessionId: string): Promise<import("./OpenId4VcSiopVerifierServiceOptions").OpenId4VcSiopVerifiedAuthorizationResponse>;
    findVerificationSessionForAuthorizationResponse(options: {
        authorizationResponse: OpenId4VcSiopAuthorizationResponsePayload;
        verifierId?: string;
    }): Promise<OpenId4VcVerificationSessionRecord | null>;
}
