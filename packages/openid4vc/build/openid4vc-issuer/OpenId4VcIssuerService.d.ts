import type { OpenId4VciCreateCredentialResponseOptions, OpenId4VciCreateCredentialOfferOptions, OpenId4VciCreateIssuerOptions, OpenId4VcIssuerMetadata } from './OpenId4VcIssuerServiceOptions';
import type { OpenId4VcIssuanceSessionRecord } from './repository';
import type { OpenId4VciCredentialRequest } from '../shared';
import type { AgentContext, Query, QueryOptions } from '@credo-ts/core';
import { JwsService, W3cCredentialService } from '@credo-ts/core';
import { OpenId4VcIssuerModuleConfig } from './OpenId4VcIssuerModuleConfig';
import { OpenId4VcIssuerRepository, OpenId4VcIssuerRecord, OpenId4VcIssuanceSessionRepository } from './repository';
/**
 * @internal
 */
export declare class OpenId4VcIssuerService {
    private w3cCredentialService;
    private jwsService;
    private openId4VcIssuerConfig;
    private openId4VcIssuerRepository;
    private openId4VcIssuanceSessionRepository;
    constructor(w3cCredentialService: W3cCredentialService, jwsService: JwsService, openId4VcIssuerConfig: OpenId4VcIssuerModuleConfig, openId4VcIssuerRepository: OpenId4VcIssuerRepository, openId4VcIssuanceSessionRepository: OpenId4VcIssuanceSessionRepository);
    createCredentialOffer(agentContext: AgentContext, options: OpenId4VciCreateCredentialOfferOptions & {
        issuer: OpenId4VcIssuerRecord;
    }): Promise<{
        issuanceSession: OpenId4VcIssuanceSessionRecord;
        credentialOffer: string;
    }>;
    /**
     * find the issuance session associated with a credential request. You can optionally provide a issuer id if
     * the issuer that the request is associated with is already known.
     */
    findIssuanceSessionForCredentialRequest(agentContext: AgentContext, { credentialRequest, issuerId }: {
        credentialRequest: OpenId4VciCredentialRequest;
        issuerId?: string;
    }): Promise<OpenId4VcIssuanceSessionRecord | null>;
    createCredentialResponse(agentContext: AgentContext, options: OpenId4VciCreateCredentialResponseOptions & {
        issuanceSession: OpenId4VcIssuanceSessionRecord;
    }): Promise<{
        credentialResponse: import("@sphereon/oid4vci-common").CredentialResponse;
        issuanceSession: OpenId4VcIssuanceSessionRecord;
    }>;
    findIssuanceSessionsByQuery(agentContext: AgentContext, query: Query<OpenId4VcIssuanceSessionRecord>, queryOptions?: QueryOptions): Promise<OpenId4VcIssuanceSessionRecord[]>;
    getIssuanceSessionById(agentContext: AgentContext, issuanceSessionId: string): Promise<OpenId4VcIssuanceSessionRecord>;
    getAllIssuers(agentContext: AgentContext): Promise<OpenId4VcIssuerRecord[]>;
    getIssuerByIssuerId(agentContext: AgentContext, issuerId: string): Promise<OpenId4VcIssuerRecord>;
    updateIssuer(agentContext: AgentContext, issuer: OpenId4VcIssuerRecord): Promise<void>;
    createIssuer(agentContext: AgentContext, options: OpenId4VciCreateIssuerOptions): Promise<OpenId4VcIssuerRecord>;
    rotateAccessTokenSigningKey(agentContext: AgentContext, issuer: OpenId4VcIssuerRecord): Promise<void>;
    getIssuerMetadata(agentContext: AgentContext, issuerRecord: OpenId4VcIssuerRecord): OpenId4VcIssuerMetadata;
    private getJwtVerifyCallback;
    private getVcIssuer;
    private getGrantsFromConfig;
    private findOfferedCredentialsMatchingRequest;
    private getSdJwtVcCredentialSigningCallback;
    private getW3cCredentialSigningCallback;
    private getHolderBindingFromRequest;
    private getCredentialDataSupplier;
}
