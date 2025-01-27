import type { AnonCredsCreateLinkSecretOptions, AnonCredsRegisterCredentialDefinitionOptions, AnonCredsRegisterRevocationRegistryDefinitionOptions, AnonCredsRegisterRevocationStatusListOptions, AnonCredsUpdateRevocationStatusListOptions } from './AnonCredsApiOptions';
import type { AnonCredsSchema } from './models';
import type { GetCredentialDefinitionReturn, GetCredentialsOptions, GetRevocationRegistryDefinitionReturn, GetRevocationStatusListReturn, GetSchemaReturn, RegisterCredentialDefinitionReturn, RegisterSchemaReturn, RegisterRevocationRegistryDefinitionReturn, RegisterRevocationStatusListReturn } from './services';
import type { Extensible } from './services/registry/base';
import type { SimpleQuery } from '@credo-ts/core';
import { AgentContext } from '@credo-ts/core';
import { AnonCredsModuleConfig } from './AnonCredsModuleConfig';
import { AnonCredsRevocationRegistryDefinitionPrivateRepository, AnonCredsRevocationRegistryDefinitionRepository, AnonCredsCredentialDefinitionPrivateRepository, AnonCredsKeyCorrectnessProofRepository, AnonCredsLinkSecretRepository } from './repository';
import { AnonCredsCredentialDefinitionRecord } from './repository/AnonCredsCredentialDefinitionRecord';
import { AnonCredsCredentialDefinitionRepository } from './repository/AnonCredsCredentialDefinitionRepository';
import { AnonCredsSchemaRecord } from './repository/AnonCredsSchemaRecord';
import { AnonCredsSchemaRepository } from './repository/AnonCredsSchemaRepository';
import { AnonCredsHolderService, AnonCredsIssuerService } from './services';
import { AnonCredsRegistryService } from './services/registry/AnonCredsRegistryService';
export declare class AnonCredsApi {
    config: AnonCredsModuleConfig;
    private agentContext;
    private anonCredsRegistryService;
    private anonCredsSchemaRepository;
    private anonCredsCredentialDefinitionRepository;
    private anonCredsCredentialDefinitionPrivateRepository;
    private anonCredsRevocationRegistryDefinitionRepository;
    private anonCredsRevocationRegistryDefinitionPrivateRepository;
    private anonCredsKeyCorrectnessProofRepository;
    private anonCredsLinkSecretRepository;
    private anonCredsIssuerService;
    private anonCredsHolderService;
    constructor(agentContext: AgentContext, anonCredsRegistryService: AnonCredsRegistryService, config: AnonCredsModuleConfig, anonCredsIssuerService: AnonCredsIssuerService, anonCredsHolderService: AnonCredsHolderService, anonCredsSchemaRepository: AnonCredsSchemaRepository, anonCredsRevocationRegistryDefinitionRepository: AnonCredsRevocationRegistryDefinitionRepository, anonCredsRevocationRegistryDefinitionPrivateRepository: AnonCredsRevocationRegistryDefinitionPrivateRepository, anonCredsCredentialDefinitionRepository: AnonCredsCredentialDefinitionRepository, anonCredsCredentialDefinitionPrivateRepository: AnonCredsCredentialDefinitionPrivateRepository, anonCredsKeyCorrectnessProofRepository: AnonCredsKeyCorrectnessProofRepository, anonCredsLinkSecretRepository: AnonCredsLinkSecretRepository);
    /**
     * Create a Link Secret, optionally indicating its ID and if it will be the default one
     * If there is no default Link Secret, this will be set as default (even if setAsDefault is false).
     *
     */
    createLinkSecret(options?: AnonCredsCreateLinkSecretOptions): Promise<string>;
    /**
     * Get a list of ids for the created link secrets
     */
    getLinkSecretIds(): Promise<string[]>;
    /**
     * Retrieve a {@link AnonCredsSchema} from the registry associated
     * with the {@link schemaId}
     */
    getSchema(schemaId: string): Promise<GetSchemaReturn>;
    registerSchema<T extends Extensible = Extensible>(options: AnonCredsRegisterSchema<T>): Promise<RegisterSchemaReturn>;
    getCreatedSchemas(query: SimpleQuery<AnonCredsSchemaRecord>): Promise<AnonCredsSchemaRecord[]>;
    /**
     * Retrieve a {@link GetCredentialDefinitionReturn} from the registry associated
     * with the {@link credentialDefinitionId}
     */
    getCredentialDefinition(credentialDefinitionId: string): Promise<GetCredentialDefinitionReturn>;
    registerCredentialDefinition<T extends Extensible>(options: AnonCredsRegisterCredentialDefinition<T>): Promise<RegisterCredentialDefinitionReturn>;
    getCreatedCredentialDefinitions(query: SimpleQuery<AnonCredsCredentialDefinitionRecord>): Promise<AnonCredsCredentialDefinitionRecord[]>;
    /**
     * Retrieve a {@link AnonCredsRevocationRegistryDefinition} from the registry associated
     * with the {@link revocationRegistryDefinitionId}
     */
    getRevocationRegistryDefinition(revocationRegistryDefinitionId: string): Promise<GetRevocationRegistryDefinitionReturn>;
    registerRevocationRegistryDefinition<T extends Extensible = Extensible>(options: AnonCredsRegisterRevocationRegistryDefinition<T>): Promise<RegisterRevocationRegistryDefinitionReturn>;
    /**
     * Retrieve the {@link AnonCredsRevocationStatusList} for the given {@link timestamp} from the registry associated
     * with the {@link revocationRegistryDefinitionId}
     */
    getRevocationStatusList(revocationRegistryDefinitionId: string, timestamp: number): Promise<GetRevocationStatusListReturn>;
    registerRevocationStatusList<T extends Extensible = Extensible>(options: AnonCredsRegisterRevocationStatusList<T>): Promise<RegisterRevocationStatusListReturn>;
    updateRevocationStatusList<T extends Extensible = Extensible>(options: AnonCredsUpdateRevocationStatusList<T>): Promise<RegisterRevocationStatusListReturn>;
    getCredential(id: string): Promise<import("./models").AnonCredsCredentialInfo>;
    getCredentials(options: GetCredentialsOptions): Promise<import("./models").AnonCredsCredentialInfo[]>;
    private storeRevocationRegistryDefinitionRecord;
    private storeCredentialDefinitionPrivateAndKeyCorrectnessRecord;
    private storeCredentialDefinitionRecord;
    private storeSchemaRecord;
    private findRegistryForIdentifier;
}
export interface AnonCredsRegisterCredentialDefinitionApiOptions {
    supportRevocation: boolean;
}
interface AnonCredsRegisterCredentialDefinition<T extends Extensible = Extensible> {
    credentialDefinition: AnonCredsRegisterCredentialDefinitionOptions;
    options: T & AnonCredsRegisterCredentialDefinitionApiOptions;
}
interface AnonCredsRegisterSchema<T extends Extensible = Extensible> {
    schema: AnonCredsSchema;
    options: T;
}
interface AnonCredsRegisterRevocationRegistryDefinition<T extends Extensible = Extensible> {
    revocationRegistryDefinition: AnonCredsRegisterRevocationRegistryDefinitionOptions;
    options: T;
}
interface AnonCredsRegisterRevocationStatusList<T extends Extensible = Extensible> {
    revocationStatusList: AnonCredsRegisterRevocationStatusListOptions;
    options: T;
}
interface AnonCredsUpdateRevocationStatusList<T extends Extensible = Extensible> {
    revocationStatusList: AnonCredsUpdateRevocationStatusListOptions;
    options: T;
}
export {};
