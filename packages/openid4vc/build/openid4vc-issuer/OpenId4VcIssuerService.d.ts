import type { OpenId4VciCreateCredentialResponseOptions, OpenId4VciCreateCredentialOfferOptions, OpenId4VciCreateIssuerOptions, OpenId4VciCreateStatelessCredentialOfferOptions } from './OpenId4VcIssuerServiceOptions';
import type { OpenId4VciMetadata } from '../shared';
import type { AgentContext, Query, QueryOptions } from '@credo-ts/core';
import { Oauth2AuthorizationServer, Oauth2Client, Oauth2ResourceServer } from '@animo-id/oauth2';
import { Oid4vciIssuer } from '@animo-id/oid4vci';
import { W3cCredentialService } from '@credo-ts/core';
import { OpenId4VcIssuanceSessionState } from './OpenId4VcIssuanceSessionState';
import { OpenId4VcIssuerModuleConfig } from './OpenId4VcIssuerModuleConfig';
import { OpenId4VcIssuerRepository, OpenId4VcIssuerRecord, OpenId4VcIssuanceSessionRepository, OpenId4VcIssuanceSessionRecord } from './repository';
/**
 * @internal
 */
export declare class OpenId4VcIssuerService {
    private w3cCredentialService;
    private openId4VcIssuerConfig;
    private openId4VcIssuerRepository;
    private openId4VcIssuanceSessionRepository;
    constructor(w3cCredentialService: W3cCredentialService, openId4VcIssuerConfig: OpenId4VcIssuerModuleConfig, openId4VcIssuerRepository: OpenId4VcIssuerRepository, openId4VcIssuanceSessionRepository: OpenId4VcIssuanceSessionRepository);
    createStatelessCredentialOffer(agentContext: AgentContext, options: OpenId4VciCreateStatelessCredentialOfferOptions & {
        issuer: OpenId4VcIssuerRecord;
    }): Promise<{
        credentialOffer: string;
        credentialOfferObject: {
            credential_issuer: string;
            credential_configuration_ids: string[];
            grants?: ({
                authorization_code?: ({
                    issuer_state?: string | undefined;
                    authorization_server?: string | undefined;
                } & {
                    [key: string]: unknown;
                }) | undefined;
                "urn:ietf:params:oauth:grant-type:pre-authorized_code"?: ({
                    'pre-authorized_code': string;
                    authorization_server?: string | undefined;
                    tx_code?: ({
                        length?: number | undefined;
                        description?: string | undefined;
                        input_mode?: "text" | "numeric" | undefined;
                    } & {
                        [key: string]: unknown;
                    }) | undefined;
                } & {
                    [key: string]: unknown;
                }) | undefined;
            } & {
                [key: string]: unknown;
            }) | undefined;
        } & {
            [key: string]: unknown;
        };
    }>;
    createCredentialOffer(agentContext: AgentContext, options: OpenId4VciCreateCredentialOfferOptions & {
        issuer: OpenId4VcIssuerRecord;
    }): Promise<{
        issuanceSession: OpenId4VcIssuanceSessionRecord;
        credentialOffer: string;
    }>;
    createCredentialResponse(agentContext: AgentContext, options: OpenId4VciCreateCredentialResponseOptions & {
        issuanceSession: OpenId4VcIssuanceSessionRecord;
    }): Promise<{
        credentialResponse: {
            c_nonce?: string | undefined;
            c_nonce_expires_in?: number | undefined;
            credentials?: (string | {
                [x: string]: any;
            })[] | undefined;
            credential?: string | {
                [x: string]: any;
            } | undefined;
            transaction_id?: string | undefined;
            notification_id?: string | undefined;
        } & {
            [key: string]: unknown;
        };
        issuanceSession: OpenId4VcIssuanceSessionRecord;
    }>;
    findIssuanceSessionsByQuery(agentContext: AgentContext, query: Query<OpenId4VcIssuanceSessionRecord>, queryOptions?: QueryOptions): Promise<OpenId4VcIssuanceSessionRecord[]>;
    findSingleIssuancSessionByQuery(agentContext: AgentContext, query: Query<OpenId4VcIssuanceSessionRecord>): Promise<OpenId4VcIssuanceSessionRecord | null>;
    getIssuanceSessionById(agentContext: AgentContext, issuanceSessionId: string): Promise<OpenId4VcIssuanceSessionRecord>;
    getAllIssuers(agentContext: AgentContext): Promise<OpenId4VcIssuerRecord[]>;
    getIssuerByIssuerId(agentContext: AgentContext, issuerId: string): Promise<OpenId4VcIssuerRecord>;
    updateIssuer(agentContext: AgentContext, issuer: OpenId4VcIssuerRecord): Promise<void>;
    createIssuer(agentContext: AgentContext, options: OpenId4VciCreateIssuerOptions): Promise<OpenId4VcIssuerRecord>;
    rotateAccessTokenSigningKey(agentContext: AgentContext, issuer: OpenId4VcIssuerRecord, options?: Pick<OpenId4VciCreateIssuerOptions, 'accessTokenSignerKeyType'>): Promise<void>;
    /**
     * @param fetchExternalAuthorizationServerMetadata defaults to false
     */
    getIssuerMetadata(agentContext: AgentContext, issuerRecord: OpenId4VcIssuerRecord, fetchExternalAuthorizationServerMetadata?: boolean): Promise<OpenId4VciMetadata>;
    createNonce(agentContext: AgentContext, issuer: OpenId4VcIssuerRecord): Promise<{
        cNonce: string;
        cNonceExpiresAt: Date;
        cNonceExpiresInSeconds: number;
    }>;
    /**
     * @todo nonces are very short lived (1 min), but it might be nice to also cache the nonces
     * in the cache if we have 'seen' them. They will only be in the cache for a short time
     * and it will prevent replay
     */
    private verifyNonce;
    getIssuer(agentContext: AgentContext): Oid4vciIssuer;
    getOauth2Client(agentContext: AgentContext): Oauth2Client;
    getOauth2AuthorizationServer(agentContext: AgentContext): Oauth2AuthorizationServer;
    getResourceServer(agentContext: AgentContext, issuerRecord: OpenId4VcIssuerRecord): Oauth2ResourceServer;
    /**
     * Update the record to a new state and emit an state changed event. Also updates the record
     * in storage.
     */
    updateState(agentContext: AgentContext, issuanceSession: OpenId4VcIssuanceSessionRecord, newState: OpenId4VcIssuanceSessionState): Promise<void>;
    emitStateChangedEvent(agentContext: AgentContext, issuanceSession: OpenId4VcIssuanceSessionRecord, previousState: OpenId4VcIssuanceSessionState | null): void;
    private getGrantsFromConfig;
    private getHolderBindingFromRequestProofs;
    private getCredentialConfigurationsForRequest;
    private getSignedCredentials;
    private signW3cCredential;
}
