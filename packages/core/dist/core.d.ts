/// <reference types="node" />

import type { BlobReaderHandle } from 'indy-sdk';
import { Buffer as Buffer_2 } from 'buffer/';
import type { Cred } from 'indy-sdk';
import { CredDef } from 'indy-sdk';
import type { CredDefId } from 'indy-sdk';
import type { CredOffer } from 'indy-sdk';
import type { CredReq } from 'indy-sdk';
import type { CredReqMetadata } from 'indy-sdk';
import type { CredRevocId } from 'indy-sdk';
import type { CredValues } from 'indy-sdk';
import type { default as default_2 } from 'indy-sdk';
import type { DependencyContainer } from 'tsyringe';
import type { DIDDocumentMetadata } from 'did-resolver';
import type { DIDResolutionMetadata } from 'did-resolver';
import type { DIDResolutionOptions } from 'did-resolver';
import type { EventEmitter as EventEmitter_2 } from 'events';
import type fetch from 'node-fetch';
import { GetNymResponse } from 'indy-sdk';
import type * as Indy from 'indy-sdk';
import type { IndyCredential } from 'indy-sdk';
import type { IndyCredentialInfo as IndyCredentialInfo_2 } from 'indy-sdk';
import type { IndyProof } from 'indy-sdk';
import type { IndyProofRequest } from 'indy-sdk';
import type { IndyRequestedCredentials } from 'indy-sdk';
import makeError from 'make-error';
import type { NymRole } from 'indy-sdk';
import { Observable } from 'rxjs';
import { Schema } from 'indy-sdk';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';
import { Verkey } from 'indy-sdk';
import type WebSocket from 'ws';

export declare interface AcceptanceMechanisms {
    aml: Record<string, string>;
    amlContext: string;
    version: string;
}

/**
 * Represents `~please_ack` decorator
 */
declare class AckDecorator {
}

/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0015-acks/README.md#explicit-acks
 */
declare class AckMessage extends AgentMessage {
    /**
     * Create new AckMessage instance.
     * @param options
     */
    constructor(options: AckMessageOptions);
    readonly type: string;
    static readonly type: string;
    status: AckStatus;
}

declare interface AckMessageOptions {
    id?: string;
    threadId: string;
    status: AckStatus;
}

/**
 * Ack message status types
 */
declare enum AckStatus {
    OK = "OK",
    FAIL = "FAIL",
    PENDING = "PENDING"
}

export declare class Agent {
    protected agentConfig: AgentConfig;
    protected logger: Logger;
    protected container: DependencyContainer;
    protected eventEmitter: EventEmitter;
    protected messageReceiver: MessageReceiver;
    protected transportService: TransportService;
    protected messageSender: MessageSender;
    private _isInitialized;
    messageSubscription: Subscription;
    private walletService;
    readonly connections: ConnectionsModule;
    readonly proofs: ProofsModule;
    readonly basicMessages: BasicMessagesModule;
    readonly ledger: LedgerModule;
    readonly credentials: CredentialsModule;
    readonly mediationRecipient: RecipientModule;
    readonly mediator: MediatorModule;
    readonly discovery: DiscoverFeaturesModule;
    readonly dids: DidsModule;
    readonly wallet: WalletModule;
    constructor(initialConfig: InitConfig, dependencies: AgentDependencies, injectionContainer?: DependencyContainer);
    registerInboundTransport(inboundTransport: InboundTransport): void;
    get inboundTransports(): InboundTransport[];
    registerOutboundTransport(outboundTransport: OutboundTransport): void;
    get outboundTransports(): OutboundTransport[];
    get events(): EventEmitter;
    get isInitialized(): boolean;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    get publicDid(): DidInfo | undefined;
    receiveMessage(inboundMessage: unknown, session?: TransportSession): Promise<void>;
    get injectionContainer(): DependencyContainer;
    get config(): AgentConfig;
}

export declare class AgentConfig {
    private initConfig;
    label: string;
    logger: Logger;
    readonly agentDependencies: AgentDependencies;
    readonly fileSystem: FileSystem;
    readonly stop$: Subject<boolean>;
    constructor(initConfig: InitConfig, agentDependencies: AgentDependencies);
    get connectToIndyLedgersOnStartup(): boolean;
    get publicDidSeed(): string | undefined;
    get indyLedgers(): IndyPoolConfig[];
    get walletConfig(): WalletConfig | undefined;
    get autoAcceptConnections(): boolean;
    get autoAcceptProofs(): AutoAcceptProof;
    get autoAcceptCredentials(): AutoAcceptCredential;
    get didCommMimeType(): DidCommMimeType;
    get mediatorPollingInterval(): number;
    get mediatorPickupStrategy(): MediatorPickupStrategy | undefined;
    get maximumMessagePickup(): number;
    get endpoints(): [string, ...string[]];
    get mediatorConnectionsInvite(): string | undefined;
    get autoAcceptMediationRequests(): boolean;
    get defaultMediatorId(): string | undefined;
    get clearDefaultMediator(): boolean;
    get useLegacyDidSovPrefix(): boolean;
    get connectionImageUrl(): string | undefined;
    get autoUpdateStorageOnStartup(): boolean;
}

export declare interface AgentDependencies {
    FileSystem: {
        new (): FileSystem;
    };
    indy: typeof Indy;
    EventEmitterClass: typeof EventEmitter_2;
    fetch: typeof fetch;
    WebSocketClass: typeof WebSocket;
}

export declare class AgentMessage extends AgentMessage_base {
    toJSON({ useLegacyDidSovPrefix }?: {
        useLegacyDidSovPrefix?: boolean;
    }): Record<string, unknown>;
    is<C extends typeof AgentMessage>(Class: C): this is InstanceType<C>;
}

declare const AgentMessage_base: Constructor<    {
thread?: ThreadDecorator | undefined;
readonly threadId: string;
setThread(options: Partial<ThreadDecorator>): void;
id: string;
readonly type: string;
generateId(): string;
} & BaseMessage & {
l10n?: L10nDecorator | undefined;
addLocale(locale: string): void;
getLocale(): string | undefined;
id: string;
readonly type: string;
generateId(): string;
} & {
transport?: TransportDecorator | undefined;
setReturnRouting(type: ReturnRouteTypes, thread?: string | undefined): void;
hasReturnRouting(threadId?: string | undefined): boolean;
hasAnyReturnRoute(): boolean;
id: string;
readonly type: string;
generateId(): string;
} & {
timing?: TimingDecorator | undefined;
setTiming(options: Partial<TimingDecorator>): void;
id: string;
readonly type: string;
generateId(): string;
} & {
pleaseAck?: AckDecorator | undefined;
setPleaseAck(): void;
getPleaseAck(): AckDecorator | undefined;
requiresAck(): boolean;
id: string;
readonly type: string;
generateId(): string;
} & {
attachments?: Attachment[] | undefined;
getAttachmentById(id: string): Attachment | undefined;
addAttachment(attachment: Attachment): void;
id: string;
readonly type: string;
generateId(): string;
} & {
service?: ServiceDecorator | undefined;
setService(serviceData: ServiceDecoratorOptions): void;
id: string;
readonly type: string;
generateId(): string;
}> & BaseMessage;

export declare class AriesFrameworkError extends BaseError {
    /**
     * Create base AriesFrameworkError.
     * @param message the error message
     * @param cause the error that caused this error to be created
     */
    constructor(message: string, { cause }?: {
        cause?: Error;
    });
}

/**
 * Represents DIDComm attachment
 * https://github.com/hyperledger/aries-rfcs/blob/master/concepts/0017-attachments/README.md
 */
declare class Attachment {
    constructor(options: AttachmentOptions);
    id: string;
    /**
     * An optional human-readable description of the content.
     */
    description?: string;
    /**
     * A hint about the name that might be used if this attachment is persisted as a file. It is not required, and need not be unique. If this field is present and mime-type is not, the extension on the filename may be used to infer a MIME type.
     */
    filename?: string;
    /**
     * Describes the MIME type of the attached content. Optional but recommended.
     */
    mimeType?: string;
    /**
     * A hint about when the content in this attachment was last modified.
     */
    lastmodTime?: Date;
    /**
     * Optional, and mostly relevant when content is included by reference instead of by value. Lets the receiver guess how expensive it will be, in time, bandwidth, and storage, to fully fetch the attachment.
     */
    byteCount?: number;
    data: AttachmentData;
    getDataAsJson<T>(): T;
    addJws(jws: JwsGeneralFormat): void;
}

/**
 * A JSON object that gives access to the actual content of the attachment
 */
declare class AttachmentData {
    /**
     * Base64-encoded data, when representing arbitrary content inline instead of via links. Optional.
     */
    base64?: string;
    /**
     *  Directly embedded JSON data, when representing content inline instead of via links, and when the content is natively conveyable as JSON. Optional.
     */
    json?: Record<string, unknown>;
    /**
     * A list of zero or more locations at which the content may be fetched. Optional.
     */
    links?: string[];
    /**
     * A JSON Web Signature over the content of the attachment. Optional.
     */
    jws?: Jws;
    /**
     * The hash of the content. Optional.
     */
    sha256?: string;
    constructor(options: AttachmentDataOptions);
}

declare interface AttachmentDataOptions {
    base64?: string;
    json?: Record<string, unknown>;
    links?: string[];
    jws?: Jws;
    sha256?: string;
}

declare interface AttachmentOptions {
    id?: string;
    description?: string;
    filename?: string;
    mimeType?: string;
    lastmodTime?: Date;
    byteCount?: number;
    data: AttachmentData;
}

export declare class AttributeFilter {
    constructor(options: AttributeFilter);
    schemaId?: string;
    schemaIssuerDid?: string;
    schemaName?: string;
    schemaVersion?: string;
    issuerDid?: string;
    credentialDefinitionId?: string;
    attributeValue?: AttributeValue;
}

/**
 * Decorator that transforms attribute filter to corresponding class instances.
 * Needed for transformation of attribute value filter.
 *
 * Transforms attribute value between these formats:
 *
 * JSON:
 * ```json
 * {
 *  "attr::test_prop::value": "test_value"
 * }
 * ```
 *
 * Class:
 * ```json
 * {
 *  "attributeValue": {
 *    "name": "test_props",
 *    "value": "test_value"
 *  }
 * }
 * ```
 *
 * @example
 * class Example {
 *   AttributeFilterTransformer()
 *   public attributeFilter?: AttributeFilter;
 * }
 *
 * @see https://github.com/hyperledger/aries-framework-dotnet/blob/a18bef91e5b9e4a1892818df7408e2383c642dfa/src/Hyperledger.Aries/Features/PresentProof/Models/AttributeFilterConverter.cs
 */
export declare function AttributeFilterTransformer(): PropertyDecorator;

export declare class AttributeValue {
    constructor(options: AttributeValue);
    name: string;
    value: string;
}

export declare abstract class Authentication {
    abstract publicKey: PublicKey;
}

/**
 * Decorator that transforms authentication json to corresonding class instances. See {@link authenticationTypes}
 *
 * @example
 * class Example {
 *   AuthenticationTransformer()
 *   private authentication: Authentication
 * }
 */
export declare function AuthenticationTransformer(): PropertyDecorator;

export declare const authenticationTypes: {
    RsaVerificationKey2018: string;
    Ed25519VerificationKey2018: string;
    Secp256k1VerificationKey2018: string;
};

export declare interface AuthorAgreement {
    digest: string;
    version: string;
    text: string;
    ratification_ts: number;
    acceptanceMechanisms: AcceptanceMechanisms;
}

/**
 * Typing of the state for auto acceptance
 */
export declare enum AutoAcceptCredential {
    Always = "always",
    ContentApproved = "contentApproved",
    Never = "never"
}

/**
 * Typing of the state for auto acceptance
 */
export declare enum AutoAcceptProof {
    Always = "always",
    ContentApproved = "contentApproved",
    Never = "never"
}

/**
 * Create a new error instance of `cause` property support.
 */
declare class BaseError extends makeError.BaseError {
    cause?: Error | undefined;
    protected constructor(message?: string, cause?: Error | undefined);
    inspect(): string;
}

export declare interface BaseEvent {
    type: string;
    payload: Record<string, unknown>;
}

export declare interface BaseInvitationOptions {
    id?: string;
    label: string;
    imageUrl?: string;
}

export declare abstract class BaseLogger implements Logger {
    logLevel: LogLevel;
    constructor(logLevel?: LogLevel);
    isEnabled(logLevel: LogLevel): boolean;
    abstract test(message: string, data?: Record<string, any>): void;
    abstract trace(message: string, data?: Record<string, any>): void;
    abstract debug(message: string, data?: Record<string, any>): void;
    abstract info(message: string, data?: Record<string, any>): void;
    abstract warn(message: string, data?: Record<string, any>): void;
    abstract error(message: string, data?: Record<string, any>): void;
    abstract fatal(message: string, data?: Record<string, any>): void;
}

declare class BaseMessage {
    id: string;
    readonly type: string;
    static readonly type: string;
    generateId(): string;
}

export declare abstract class BaseRecord<DefaultTags extends TagsBase = TagsBase, CustomTags extends TagsBase = TagsBase, MetadataValues = undefined> {
    protected _tags: CustomTags;
    id: string;
    createdAt: Date;
    updatedAt?: Date;
    readonly type: string;
    static readonly type: string;
    /** @inheritdoc {Metadata#Metadata} */
    metadata: Metadata<MetadataValues>;
    /**
     * Get all tags. This is includes custom and default tags
     * @returns tags object
     */
    abstract getTags(): Tags<DefaultTags, CustomTags>;
    /**
     * Set the value for a tag
     * @param name name of the tag
     * @param value value of the tag
     */
    setTag(name: keyof CustomTags, value: CustomTags[keyof CustomTags]): void;
    /**
     * Get the value for a tag
     * @param name name of the tag
     * @returns The tag value, or undefined if not found
     */
    getTag(name: keyof CustomTags | keyof DefaultTags): Tags<DefaultTags, CustomTags>[keyof CustomTags | keyof DefaultTags];
    /**
     * Set custom tags. This will merge the tags object with passed in tag properties
     *
     * @param tags the tags to set
     */
    setTags(tags: Partial<CustomTags>): void;
    /**
     * Replace tags. This will replace the whole tags object.
     * Default tags will still be overridden when retrieving tags
     *
     * @param tags the tags to set
     */
    replaceTags(tags: CustomTags & Partial<DefaultTags>): void;
    toJSON(): Record<string, unknown>;
}

declare interface BaseRecordConstructor<T> extends Constructor<T> {
    type: string;
}

export declare class BasicMessage extends AgentMessage {
    /**
     * Create new BasicMessage instance.
     * sentTime will be assigned to new Date if not passed, id will be assigned to uuid/v4 if not passed
     * @param options
     */
    constructor(options: {
        content: string;
        sentTime?: Date;
        id?: string;
        locale?: string;
    });
    readonly type = "https://didcomm.org/basicmessage/1.0/message";
    static readonly type = "https://didcomm.org/basicmessage/1.0/message";
    sentTime: Date;
    content: string;
}

export declare enum BasicMessageEventTypes {
    BasicMessageStateChanged = "BasicMessageStateChanged"
}

export declare class BasicMessageRecord extends BaseRecord<DefaultBasicMessageTags, CustomBasicMessageTags> {
    content: string;
    sentTime: string;
    connectionId: string;
    role: BasicMessageRole;
    static readonly type = "BasicMessageRecord";
    readonly type = "BasicMessageRecord";
    constructor(props: BasicMessageStorageProps);
    getTags(): {
        connectionId: string;
        role: BasicMessageRole;
    };
}

export declare class BasicMessageRepository extends Repository<BasicMessageRecord> {
    constructor(storageService: StorageService<BasicMessageRecord>);
}

export declare enum BasicMessageRole {
    Sender = "sender",
    Receiver = "receiver"
}

export declare class BasicMessageService {
    private basicMessageRepository;
    private eventEmitter;
    constructor(basicMessageRepository: BasicMessageRepository, eventEmitter: EventEmitter);
    createMessage(message: string, connectionRecord: ConnectionRecord): Promise<BasicMessage>;
    /**
     * @todo use connection from message context
     */
    save({ message }: InboundMessageContext<BasicMessage>, connection: ConnectionRecord): Promise<void>;
    findAllByQuery(query: Partial<BasicMessageTags>): Promise<BasicMessageRecord[]>;
}

export declare class BasicMessagesModule {
    private basicMessageService;
    private messageSender;
    private connectionService;
    constructor(dispatcher: Dispatcher, basicMessageService: BasicMessageService, messageSender: MessageSender, connectionService: ConnectionService);
    sendMessage(connectionId: string, message: string): Promise<void>;
    findAllByQuery(query: Partial<BasicMessageTags>): Promise<BasicMessageRecord[]>;
    private registerHandlers;
}

export declare interface BasicMessageStateChangedEvent extends BaseEvent {
    type: typeof BasicMessageEventTypes.BasicMessageStateChanged;
    payload: {
        message: BasicMessage;
        basicMessageRecord: BasicMessageRecord;
    };
}

export declare interface BasicMessageStorageProps {
    id?: string;
    createdAt?: Date;
    connectionId: string;
    role: BasicMessageRole;
    tags?: CustomBasicMessageTags;
    content: string;
    sentTime: string;
}

export declare type BasicMessageTags = RecordTags<BasicMessageRecord>;

/**
 * A message that contains multiple waiting messages.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0212-pickup/README.md#batch
 */
export declare class BatchMessage extends AgentMessage {
    constructor(options: BatchMessageOptions);
    readonly type = "https://didcomm.org/messagepickup/1.0/batch";
    static readonly type = "https://didcomm.org/messagepickup/1.0/batch";
    messages: BatchMessageMessage[];
}

export declare class BatchMessageMessage {
    constructor(options: {
        id?: string;
        message: EncryptedMessage;
    });
    id: string;
    message: EncryptedMessage;
}

export declare interface BatchMessageOptions {
    id?: string;
    messages: BatchMessageMessage[];
}

/**
 * A message to request to have multiple waiting messages sent inside a `batch` message.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0212-pickup/README.md#batch-pickup
 */
export declare class BatchPickupMessage extends AgentMessage {
    /**
     * Create new BatchPickupMessage instance.
     *
     * @param options
     */
    constructor(options: BatchPickupMessageOptions);
    readonly type = "https://didcomm.org/messagepickup/1.0/batch-pickup";
    static readonly type = "https://didcomm.org/messagepickup/1.0/batch-pickup";
    batchSize: number;
}

export declare interface BatchPickupMessageOptions {
    id?: string;
    batchSize: number;
}

export declare interface CachedDidResponse {
    nymResponse: Indy.GetNymResponse;
    poolId: string;
}

declare class CacheRecord extends BaseRecord<DefaultCacheTags, CustomCacheTags> {
    entries: Array<{
        key: string;
        value: unknown;
    }>;
    static readonly type = "CacheRecord";
    readonly type = "CacheRecord";
    constructor(props: CacheStorageProps);
    getTags(): {
        [x: string]: TagValue;
        [x: number]: never;
    };
}

declare class CacheRepository extends Repository<CacheRecord> {
    constructor(storageService: StorageService<CacheRecord>);
}

declare interface CacheStorageProps {
    id?: string;
    createdAt?: Date;
    tags?: CustomCacheTags;
    entries: Array<{
        key: string;
        value: unknown;
    }>;
}

export declare class Connection {
    constructor(options: ConnectionOptions);
    did: string;
    didDoc?: DidDoc;
}

export declare enum ConnectionEventTypes {
    ConnectionStateChanged = "ConnectionStateChanged"
}

/**
 * Message to invite another agent to create a connection
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0160-connection-protocol/README.md#0-invitation-to-connect
 */
export declare class ConnectionInvitationMessage extends AgentMessage {
    /**
     * Create new ConnectionInvitationMessage instance.
     * @param options
     */
    constructor(options: BaseInvitationOptions & (DIDInvitationOptions | InlineInvitationOptions));
    readonly type = "https://didcomm.org/connections/1.0/invitation";
    static readonly type = "https://didcomm.org/connections/1.0/invitation";
    label: string;
    did?: string;
    recipientKeys?: string[];
    serviceEndpoint?: string;
    routingKeys?: string[];
    imageUrl?: string;
    /**
     * Create an invitation url from this instance
     *
     * @param domain domain name to use for invitation url
     * @returns invitation url with base64 encoded invitation
     */
    toUrl({ domain, useLegacyDidSovPrefix }: {
        domain: string;
        useLegacyDidSovPrefix?: boolean;
    }): string;
    /**
     * Create a `ConnectionInvitationMessage` instance from the `c_i` or `d_m` parameter of an URL
     *
     * @param invitationUrl invitation url containing c_i or d_m parameter
     *
     * @throws Error when url can not be decoded to JSON, or decoded message is not a valid `ConnectionInvitationMessage`
     * @throws Error when the url does not contain c_i or d_m as parameter
     */
    static fromUrl(invitationUrl: string): Promise<ConnectionInvitationMessage>;
}

export declare interface ConnectionOptions {
    did: string;
    didDoc?: DidDoc;
}

/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0035-report-problem/README.md
 */
export declare class ConnectionProblemReportMessage extends ProblemReportMessage {
    /**
     * Create new ConnectionProblemReportMessage instance.
     * @param options
     */
    constructor(options: ConnectionProblemReportMessageOptions);
    readonly type = "https://didcomm.org/connection/1.0/problem-report";
    static readonly type = "https://didcomm.org/connection/1.0/problem-report";
}

export declare type ConnectionProblemReportMessageOptions = ProblemReportMessageOptions;

export declare interface ConnectionProtocolMsgReturnType<MessageType extends AgentMessage> {
    message: MessageType;
    connectionRecord: ConnectionRecord;
}

export declare class ConnectionRecord extends BaseRecord<DefaultConnectionTags, CustomConnectionTags> implements ConnectionRecordProps {
    state: ConnectionState;
    role: ConnectionRole;
    didDoc: DidDoc;
    did: string;
    verkey: string;
    theirDidDoc?: DidDoc;
    theirDid?: string;
    theirLabel?: string;
    invitation?: ConnectionInvitationMessage;
    alias?: string;
    autoAcceptConnection?: boolean;
    imageUrl?: string;
    multiUseInvitation: boolean;
    threadId?: string;
    mediatorId?: string;
    errorMessage?: string;
    static readonly type = "ConnectionRecord";
    readonly type = "ConnectionRecord";
    constructor(props: ConnectionRecordProps);
    getTags(): {
        state: ConnectionState;
        role: ConnectionRole;
        invitationKey: string | undefined;
        threadId: string | undefined;
        verkey: string;
        theirKey: string | undefined;
        mediatorId: string | undefined;
        did: string;
        theirDid: string | undefined;
    };
    get myKey(): string | null;
    get theirKey(): string | null;
    get isReady(): boolean;
    assertReady(): void;
    assertState(expectedStates: ConnectionState | ConnectionState[]): void;
    assertRole(expectedRole: ConnectionRole): void;
}

export declare interface ConnectionRecordProps {
    id?: string;
    createdAt?: Date;
    did: string;
    didDoc: DidDoc;
    verkey: string;
    theirDid?: string;
    theirDidDoc?: DidDoc;
    theirLabel?: string;
    invitation?: ConnectionInvitationMessage;
    state: ConnectionState;
    role: ConnectionRole;
    alias?: string;
    autoAcceptConnection?: boolean;
    threadId?: string;
    tags?: CustomConnectionTags;
    imageUrl?: string;
    multiUseInvitation: boolean;
    mediatorId?: string;
    errorMessage?: string;
}

export declare class ConnectionRepository extends Repository<ConnectionRecord> {
    constructor(storageService: StorageService<ConnectionRecord>);
    findByDids({ ourDid, theirDid }: {
        ourDid: string;
        theirDid: string;
    }): Promise<ConnectionRecord | null>;
    findByVerkey(verkey: string): Promise<ConnectionRecord | null>;
    findByTheirKey(verkey: string): Promise<ConnectionRecord | null>;
    findByInvitationKey(key: string): Promise<ConnectionRecord | null>;
    getByThreadId(threadId: string): Promise<ConnectionRecord>;
}

/**
 * Message to communicate the DID document to the other agent when creating a connection
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0160-connection-protocol/README.md#1-connection-request
 */
export declare class ConnectionRequestMessage extends AgentMessage {
    /**
     * Create new ConnectionRequestMessage instance.
     * @param options
     */
    constructor(options: ConnectionRequestMessageOptions);
    readonly type = "https://didcomm.org/connections/1.0/request";
    static readonly type = "https://didcomm.org/connections/1.0/request";
    label: string;
    connection: Connection;
    imageUrl?: string;
}

export declare interface ConnectionRequestMessageOptions {
    id?: string;
    label: string;
    did: string;
    didDoc?: DidDoc;
    imageUrl?: string;
}

/**
 * Message part of connection protocol used to complete the connection
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0160-connection-protocol/README.md#2-connection-response
 */
export declare class ConnectionResponseMessage extends AgentMessage {
    /**
     * Create new ConnectionResponseMessage instance.
     * @param options
     */
    constructor(options: ConnectionResponseMessageOptions);
    readonly type = "https://didcomm.org/connections/1.0/response";
    static readonly type = "https://didcomm.org/connections/1.0/response";
    connectionSig: SignatureDecorator;
}

export declare interface ConnectionResponseMessageOptions {
    id?: string;
    threadId: string;
    connectionSig: SignatureDecorator;
}

export declare enum ConnectionRole {
    Inviter = "inviter",
    Invitee = "invitee"
}

export declare class ConnectionService {
    private wallet;
    private config;
    private connectionRepository;
    private eventEmitter;
    private logger;
    constructor(wallet: Wallet, config: AgentConfig, connectionRepository: ConnectionRepository, eventEmitter: EventEmitter);
    /**
     * Create a new connection record containing a connection invitation message
     *
     * @param config config for creation of connection and invitation
     * @returns new connection record
     */
    createInvitation(config: {
        routing: Routing;
        autoAcceptConnection?: boolean;
        alias?: string;
        multiUseInvitation?: boolean;
        myLabel?: string;
        myImageUrl?: string;
    }): Promise<ConnectionProtocolMsgReturnType<ConnectionInvitationMessage>>;
    /**
     * Process a received invitation message. This will not accept the invitation
     * or send an invitation request message. It will only create a connection record
     * with all the information about the invitation stored. Use {@link ConnectionService.createRequest}
     * after calling this function to create a connection request.
     *
     * @param invitation the invitation message to process
     * @returns new connection record.
     */
    processInvitation(invitation: ConnectionInvitationMessage, config: {
        routing: Routing;
        autoAcceptConnection?: boolean;
        alias?: string;
    }): Promise<ConnectionRecord>;
    /**
     * Create a connection request message for the connection with the specified connection id.
     *
     * @param connectionId the id of the connection for which to create a connection request
     * @param config config for creation of connection request
     * @returns outbound message containing connection request
     */
    createRequest(connectionId: string, config?: {
        myLabel?: string;
        myImageUrl?: string;
        autoAcceptConnection?: boolean;
    }): Promise<ConnectionProtocolMsgReturnType<ConnectionRequestMessage>>;
    /**
     * Process a received connection request message. This will not accept the connection request
     * or send a connection response message. It will only update the existing connection record
     * with all the new information from the connection request message. Use {@link ConnectionService.createResponse}
     * after calling this function to create a connection response.
     *
     * @param messageContext the message context containing a connection request message
     * @returns updated connection record
     */
    processRequest(messageContext: InboundMessageContext<ConnectionRequestMessage>, routing?: Routing): Promise<ConnectionRecord>;
    /**
     * Create a connection response message for the connection with the specified connection id.
     *
     * @param connectionId the id of the connection for which to create a connection response
     * @returns outbound message containing connection response
     */
    createResponse(connectionId: string): Promise<ConnectionProtocolMsgReturnType<ConnectionResponseMessage>>;
    /**
     * Process a received connection response message. This will not accept the connection request
     * or send a connection acknowledgement message. It will only update the existing connection record
     * with all the new information from the connection response message. Use {@link ConnectionService.createTrustPing}
     * after calling this function to create a trust ping message.
     *
     * @param messageContext the message context containing a connection response message
     * @returns updated connection record
     */
    processResponse(messageContext: InboundMessageContext<ConnectionResponseMessage>): Promise<ConnectionRecord>;
    /**
     * Create a trust ping message for the connection with the specified connection id.
     *
     * By default a trust ping message should elicit a response. If this is not desired the
     * `config.responseRequested` property can be set to `false`.
     *
     * @param connectionId the id of the connection for which to create a trust ping message
     * @param config the config for the trust ping message
     * @returns outbound message containing trust ping message
     */
    createTrustPing(connectionId: string, config?: {
        responseRequested?: boolean;
        comment?: string;
    }): Promise<ConnectionProtocolMsgReturnType<TrustPingMessage>>;
    /**
     * Process a received ack message. This will update the state of the connection
     * to Completed if this is not already the case.
     *
     * @param messageContext the message context containing an ack message
     * @returns updated connection record
     */
    processAck(messageContext: InboundMessageContext<AckMessage>): Promise<ConnectionRecord>;
    /**
     * Process a received {@link ProblemReportMessage}.
     *
     * @param messageContext The message context containing a connection problem report message
     * @returns connection record associated with the connection problem report message
     *
     */
    processProblemReport(messageContext: InboundMessageContext<ConnectionProblemReportMessage>): Promise<ConnectionRecord>;
    /**
     * Assert that an inbound message either has a connection associated with it,
     * or has everything correctly set up for connection-less exchange.
     *
     * @param messageContext - the inbound message context
     * @param previousRespondence - previous sent and received message to determine if a valid service decorator is present
     */
    assertConnectionOrServiceDecorator(messageContext: InboundMessageContext, { previousSentMessage, previousReceivedMessage, }?: {
        previousSentMessage?: AgentMessage;
        previousReceivedMessage?: AgentMessage;
    }): void;
    updateState(connectionRecord: ConnectionRecord, newState: ConnectionState): Promise<void>;
    update(connectionRecord: ConnectionRecord): Promise<void>;
    /**
     * Retrieve all connections records
     *
     * @returns List containing all connection records
     */
    getAll(): Promise<ConnectionRecord[]>;
    /**
     * Retrieve a connection record by id
     *
     * @param connectionId The connection record id
     * @throws {RecordNotFoundError} If no record is found
     * @return The connection record
     *
     */
    getById(connectionId: string): Promise<ConnectionRecord>;
    /**
     * Find a connection record by id
     *
     * @param connectionId the connection record id
     * @returns The connection record or null if not found
     */
    findById(connectionId: string): Promise<ConnectionRecord | null>;
    /**
     * Delete a connection record by id
     *
     * @param connectionId the connection record id
     */
    deleteById(connectionId: string): Promise<void>;
    /**
     * Find connection by verkey.
     *
     * @param verkey the verkey to search for
     * @returns the connection record, or null if not found
     * @throws {RecordDuplicateError} if multiple connections are found for the given verkey
     */
    findByVerkey(verkey: string): Promise<ConnectionRecord | null>;
    /**
     * Find connection by their verkey.
     *
     * @param verkey the verkey to search for
     * @returns the connection record, or null if not found
     * @throws {RecordDuplicateError} if multiple connections are found for the given verkey
     */
    findByTheirKey(verkey: string): Promise<ConnectionRecord | null>;
    /**
     * Find connection by invitation key.
     *
     * @param key the invitation key to search for
     * @returns the connection record, or null if not found
     * @throws {RecordDuplicateError} if multiple connections are found for the given verkey
     */
    findByInvitationKey(key: string): Promise<ConnectionRecord | null>;
    /**
     * Retrieve a connection record by thread id
     *
     * @param threadId The thread id
     * @throws {RecordNotFoundError} If no record is found
     * @throws {RecordDuplicateError} If multiple records are found
     * @returns The connection record
     */
    getByThreadId(threadId: string): Promise<ConnectionRecord>;
    private createConnection;
    returnWhenIsConnected(connectionId: string, timeoutMs?: number): Promise<ConnectionRecord>;
}

export declare class ConnectionsModule {
    private agentConfig;
    private connectionService;
    private messageSender;
    private trustPingService;
    private mediationRecipientService;
    constructor(dispatcher: Dispatcher, agentConfig: AgentConfig, connectionService: ConnectionService, trustPingService: TrustPingService, mediationRecipientService: MediationRecipientService, messageSender: MessageSender);
    createConnection(config?: {
        autoAcceptConnection?: boolean;
        alias?: string;
        mediatorId?: string;
        multiUseInvitation?: boolean;
        myLabel?: string;
        myImageUrl?: string;
    }): Promise<{
        invitation: ConnectionInvitationMessage;
        connectionRecord: ConnectionRecord;
    }>;
    /**
     * Receive connection invitation as invitee and create connection. If auto accepting is enabled
     * via either the config passed in the function or the global agent config, a connection
     * request message will be send.
     *
     * @param invitationJson json object containing the invitation to receive
     * @param config config for handling of invitation
     * @returns new connection record
     */
    receiveInvitation(invitation: ConnectionInvitationMessage, config?: {
        autoAcceptConnection?: boolean;
        alias?: string;
        mediatorId?: string;
    }): Promise<ConnectionRecord>;
    /**
     * Receive connection invitation as invitee encoded as url and create connection. If auto accepting is enabled
     * via either the config passed in the function or the global agent config, a connection
     * request message will be send.
     *
     * @param invitationUrl url containing a base64 encoded invitation to receive
     * @param config config for handling of invitation
     * @returns new connection record
     */
    receiveInvitationFromUrl(invitationUrl: string, config?: {
        autoAcceptConnection?: boolean;
        alias?: string;
        mediatorId?: string;
    }): Promise<ConnectionRecord>;
    /**
     * Accept a connection invitation as invitee (by sending a connection request message) for the connection with the specified connection id.
     * This is not needed when auto accepting of connections is enabled.
     *
     * @param connectionId the id of the connection for which to accept the invitation
     * @returns connection record
     */
    acceptInvitation(connectionId: string, config?: {
        autoAcceptConnection?: boolean;
    }): Promise<ConnectionRecord>;
    /**
     * Accept a connection request as inviter (by sending a connection response message) for the connection with the specified connection id.
     * This is not needed when auto accepting of connection is enabled.
     *
     * @param connectionId the id of the connection for which to accept the request
     * @returns connection record
     */
    acceptRequest(connectionId: string): Promise<ConnectionRecord>;
    /**
     * Accept a connection response as invitee (by sending a trust ping message) for the connection with the specified connection id.
     * This is not needed when auto accepting of connection is enabled.
     *
     * @param connectionId the id of the connection for which to accept the response
     * @returns connection record
     */
    acceptResponse(connectionId: string): Promise<ConnectionRecord>;
    returnWhenIsConnected(connectionId: string, options?: {
        timeoutMs: number;
    }): Promise<ConnectionRecord>;
    /**
     * Retrieve all connections records
     *
     * @returns List containing all connection records
     */
    getAll(): Promise<ConnectionRecord[]>;
    /**
     * Retrieve a connection record by id
     *
     * @param connectionId The connection record id
     * @throws {RecordNotFoundError} If no record is found
     * @return The connection record
     *
     */
    getById(connectionId: string): Promise<ConnectionRecord>;
    /**
     * Find a connection record by id
     *
     * @param connectionId the connection record id
     * @returns The connection record or null if not found
     */
    findById(connectionId: string): Promise<ConnectionRecord | null>;
    /**
     * Delete a connection record by id
     *
     * @param connectionId the connection record id
     */
    deleteById(connectionId: string): Promise<void>;
    /**
     * Find connection by verkey.
     *
     * @param verkey the verkey to search for
     * @returns the connection record, or null if not found
     * @throws {RecordDuplicateError} if multiple connections are found for the given verkey
     */
    findByVerkey(verkey: string): Promise<ConnectionRecord | null>;
    /**
     * Find connection by their verkey.
     *
     * @param verkey the verkey to search for
     * @returns the connection record, or null if not found
     * @throws {RecordDuplicateError} if multiple connections are found for the given verkey
     */
    findByTheirKey(verkey: string): Promise<ConnectionRecord | null>;
    /**
     * Find connection by Invitation key.
     *
     * @param key the invitation key to search for
     * @returns the connection record, or null if not found
     * @throws {RecordDuplicateError} if multiple connections are found for the given verkey
     */
    findByInvitationKey(key: string): Promise<ConnectionRecord | null>;
    /**
     * Retrieve a connection record by thread id
     *
     * @param threadId The thread id
     * @throws {RecordNotFoundError} If no record is found
     * @throws {RecordDuplicateError} If multiple records are found
     * @returns The connection record
     */
    getByThreadId(threadId: string): Promise<ConnectionRecord>;
    private registerHandlers;
}

/**
 * Connection states as defined in RFC 0160.
 *
 * State 'null' from RFC is changed to 'init'
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0160-connection-protocol/README.md#states
 */
export declare enum ConnectionState {
    Invited = "invited",
    Requested = "requested",
    Responded = "responded",
    Complete = "complete"
}

export declare interface ConnectionStateChangedEvent extends BaseEvent {
    type: typeof ConnectionEventTypes.ConnectionStateChanged;
    payload: {
        connectionRecord: ConnectionRecord;
        previousState: ConnectionState | null;
    };
}

export declare class ConsoleLogger extends BaseLogger {
    private consoleLogMap;
    private log;
    test(message: string, data?: Record<string, any>): void;
    trace(message: string, data?: Record<string, any>): void;
    debug(message: string, data?: Record<string, any>): void;
    info(message: string, data?: Record<string, any>): void;
    warn(message: string, data?: Record<string, any>): void;
    error(message: string, data?: Record<string, any>): void;
    fatal(message: string, data?: Record<string, any>): void;
}

declare type Constructor<T = {}> = new (...args: any[]) => T;

declare interface CreateCredentialDefinitionOptions {
    issuerDid: string;
    schema: Schema;
    tag?: string;
    signatureType?: 'CL';
    supportRevocation?: boolean;
}

declare interface CreateCredentialOptions {
    credentialOffer: CredOffer;
    credentialRequest: CredReq;
    credentialValues: CredValues;
    revocationRegistryId?: string;
    tailsFilePath?: string;
}

declare interface CreateCredentialRequestOptions {
    holderDid: string;
    credentialOffer: Indy.CredOffer;
    credentialDefinition: Indy.CredDef;
}

declare interface CreateProofOptions {
    proofRequest: Indy.IndyProofRequest;
    requestedCredentials: RequestedCredentials;
    schemas: Indy.Schemas;
    credentialDefinitions: Indy.CredentialDefs;
}

export declare type CreateProofRequestOptions = Partial<Pick<ProofRequestOptions, 'name' | 'nonce' | 'requestedAttributes' | 'requestedPredicates'>>;

declare interface CreateSchemaOptions {
    originDid: string;
    name: string;
    version: string;
    attributes: string[];
}

export declare class Credential {
    constructor(options: Credential);
    credentialInfo: IndyCredentialInfo;
    interval?: RevocationInterval;
    toJSON(): IndyCredential;
}

/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0015-acks/README.md#explicit-acks
 */
export declare class CredentialAckMessage extends AckMessage {
    /**
     * Create new CredentialAckMessage instance.
     * @param options
     */
    constructor(options: CredentialAckMessageOptions);
    readonly type = "https://didcomm.org/issue-credential/1.0/ack";
    static readonly type = "https://didcomm.org/issue-credential/1.0/ack";
}

export declare type CredentialAckMessageOptions = AckMessageOptions;

export declare interface CredentialDefinitionTemplate {
    schema: Schema;
    tag: string;
    signatureType: 'CL';
    supportRevocation: boolean;
}

export declare enum CredentialEventTypes {
    CredentialStateChanged = "CredentialStateChanged",
    RevocationNotificationReceived = "RevocationNotificationReceived"
}

declare class CredentialInfo {
    constructor(options: CredentialInfoOptions);
    metadata: IndyCredentialMetadata;
    claims: Record<string, string>;
    attachments?: Attachment[];
}

declare interface CredentialInfoOptions {
    metadata?: IndyCredentialMetadata | null;
    claims: Record<string, string>;
    attachments?: Attachment[];
}

export declare type CredentialMetadata = {
    [CredentialMetadataKeys.IndyCredential]: {
        schemaId?: string;
        credentialDefinitionId?: string;
        indyRevocationRegistryId?: string;
        indyCredentialRevocationId?: string;
    };
    [CredentialMetadataKeys.IndyRequest]: CredReqMetadata;
};

export declare enum CredentialMetadataKeys {
    IndyCredential = "_internal/indyCredential",
    IndyRequest = "_internal/indyRequest"
}

export declare interface CredentialOfferTemplate {
    credentialDefinitionId: string;
    comment?: string;
    preview: CredentialPreview;
    autoAcceptCredential?: AutoAcceptCredential;
    attachments?: Attachment[];
    linkedAttachments?: LinkedAttachment[];
}

/**
 * Credential preview inner message class.
 *
 * This is not a message but an inner object for other messages in this protocol. It is used construct a preview of the data for the credential.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#preview-credential
 */
export declare class CredentialPreview {
    constructor(options: CredentialPreviewOptions);
    readonly type = "https://didcomm.org/issue-credential/1.0/credential-preview";
    static readonly type = "https://didcomm.org/issue-credential/1.0/credential-preview";
    attributes: CredentialPreviewAttribute[];
    toJSON(): Record<string, unknown>;
    /**
     * Create a credential preview from a record with name and value entries.
     *
     * @example
     * const preview = CredentialPreview.fromRecord({
     *   name: "Bob",
     *   age: "20"
     * })
     */
    static fromRecord(record: Record<string, string>): CredentialPreview;
}

export declare class CredentialPreviewAttribute {
    constructor(options: CredentialPreviewAttributeOptions);
    name: string;
    mimeType?: string;
    value: string;
    toJSON(): Record<string, unknown>;
}

declare interface CredentialPreviewAttributeOptions {
    name: string;
    mimeType?: string;
    value: string;
}

export declare interface CredentialPreviewOptions {
    attributes: CredentialPreviewAttribute[];
}

/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0035-report-problem/README.md
 */
export declare class CredentialProblemReportMessage extends ProblemReportMessage {
    /**
     * Create new CredentialProblemReportMessage instance.
     * @param options
     */
    constructor(options: CredentialProblemReportMessageOptions);
    readonly type = "https://didcomm.org/issue-credential/1.0/problem-report";
    static readonly type = "https://didcomm.org/issue-credential/1.0/problem-report";
}

export declare type CredentialProblemReportMessageOptions = ProblemReportMessageOptions;

export declare type CredentialProposeOptions = Omit<ProposeCredentialMessageOptions, 'id'> & {
    linkedAttachments?: LinkedAttachment[];
    autoAcceptCredential?: AutoAcceptCredential;
};

export declare interface CredentialProtocolMsgReturnType<MessageType extends AgentMessage> {
    message: MessageType;
    credentialRecord: CredentialRecord;
}

export declare class CredentialRecord extends BaseRecord<DefaultCredentialTags, CustomCredentialTags, CredentialMetadata> {
    connectionId?: string;
    threadId: string;
    credentialId?: string;
    state: CredentialState;
    autoAcceptCredential?: AutoAcceptCredential;
    revocationNotification?: RevocationNotification;
    errorMessage?: string;
    proposalMessage?: ProposeCredentialMessage;
    offerMessage?: OfferCredentialMessage;
    requestMessage?: RequestCredentialMessage;
    credentialMessage?: IssueCredentialMessage;
    credentialAttributes?: CredentialPreviewAttribute[];
    linkedAttachments?: Attachment[];
    static readonly type = "CredentialRecord";
    readonly type = "CredentialRecord";
    constructor(props: CredentialRecordProps);
    getTags(): {
        threadId: string;
        connectionId: string | undefined;
        state: CredentialState;
        credentialId: string | undefined;
        indyRevocationRegistryId: string | undefined;
        indyCredentialRevocationId: string | undefined;
    };
    getCredentialInfo(): CredentialInfo | null;
    assertState(expectedStates: CredentialState | CredentialState[]): void;
    assertConnection(currentConnectionId: string): void;
}

export declare interface CredentialRecordProps {
    id?: string;
    createdAt?: Date;
    state: CredentialState;
    connectionId?: string;
    threadId: string;
    credentialId?: string;
    tags?: CustomCredentialTags;
    proposalMessage?: ProposeCredentialMessage;
    offerMessage?: OfferCredentialMessage;
    requestMessage?: RequestCredentialMessage;
    credentialMessage?: IssueCredentialMessage;
    credentialAttributes?: CredentialPreviewAttribute[];
    autoAcceptCredential?: AutoAcceptCredential;
    linkedAttachments?: Attachment[];
    revocationNotification?: RevocationNotification;
    errorMessage?: string;
}

export declare class CredentialRepository extends Repository<CredentialRecord> {
    constructor(storageService: StorageService<CredentialRecord>);
}

export declare interface CredentialRequestOptions {
    holderDid: string;
    comment?: string;
    autoAcceptCredential?: AutoAcceptCredential;
}

/**
 * This class handles all the automation with all the messages in the issue credential protocol
 * Every function returns `true` if it should automate the flow and `false` if not
 */
declare class CredentialResponseCoordinator {
    private agentConfig;
    constructor(agentConfig: AgentConfig);
    /**
     * Returns the credential auto accept config based on priority:
     *	- The record config takes first priority
     *	- Otherwise the agent config
     *	- Otherwise {@link AutoAcceptCredential.Never} is returned
     */
    private static composeAutoAccept;
    /**
     * Checks whether it should automatically respond to a proposal
     */
    shouldAutoRespondToProposal(credentialRecord: CredentialRecord): boolean;
    /**
     * Checks whether it should automatically respond to an offer
     */
    shouldAutoRespondToOffer(credentialRecord: CredentialRecord): boolean;
    /**
     * Checks whether it should automatically respond to a request
     */
    shouldAutoRespondToRequest(credentialRecord: CredentialRecord): boolean;
    /**
     * Checks whether it should automatically respond to the issuance of a credential
     */
    shouldAutoRespondToIssue(credentialRecord: CredentialRecord): boolean;
    private areProposalValuesValid;
    private areOfferValuesValid;
    private areCredentialValuesValid;
    private areProposalAndOfferDefinitionIdEqual;
    private isRequestDefinitionIdValid;
}

export declare interface CredentialResponseOptions {
    comment?: string;
    autoAcceptCredential?: AutoAcceptCredential;
}

export declare class CredentialService {
    private credentialRepository;
    private connectionService;
    private ledgerService;
    private logger;
    private indyIssuerService;
    private indyHolderService;
    private eventEmitter;
    constructor(credentialRepository: CredentialRepository, connectionService: ConnectionService, ledgerService: IndyLedgerService, agentConfig: AgentConfig, indyIssuerService: IndyIssuerService, indyHolderService: IndyHolderService, eventEmitter: EventEmitter);
    /**
     * Create a {@link ProposeCredentialMessage} not bound to an existing credential exchange.
     * To create a proposal as response to an existing credential exchange, use {@link CredentialService#createProposalAsResponse}.
     *
     * @param connectionRecord The connection for which to create the credential proposal
     * @param config Additional configuration to use for the proposal
     * @returns Object containing proposal message and associated credential record
     *
     */
    createProposal(connectionRecord: ConnectionRecord, config?: CredentialProposeOptions): Promise<CredentialProtocolMsgReturnType<ProposeCredentialMessage>>;
    /**
     * Create a {@link ProposePresentationMessage} as response to a received credential offer.
     * To create a proposal not bound to an existing credential exchange, use {@link CredentialService#createProposal}.
     *
     * @param credentialRecord The credential record for which to create the credential proposal
     * @param config Additional configuration to use for the proposal
     * @returns Object containing proposal message and associated credential record
     *
     */
    createProposalAsResponse(credentialRecord: CredentialRecord, config?: CredentialProposeOptions): Promise<CredentialProtocolMsgReturnType<ProposeCredentialMessage>>;
    /**
     * Process a received {@link ProposeCredentialMessage}. This will not accept the credential proposal
     * or send a credential offer. It will only create a new, or update the existing credential record with
     * the information from the credential proposal message. Use {@link CredentialService#createOfferAsResponse}
     * after calling this method to create a credential offer.
     *
     * @param messageContext The message context containing a credential proposal message
     * @returns credential record associated with the credential proposal message
     *
     */
    processProposal(messageContext: InboundMessageContext<ProposeCredentialMessage>): Promise<CredentialRecord>;
    /**
     * Create a {@link OfferCredentialMessage} as response to a received credential proposal.
     * To create an offer not bound to an existing credential exchange, use {@link CredentialService#createOffer}.
     *
     * @param credentialRecord The credential record for which to create the credential offer
     * @param credentialTemplate The credential template to use for the offer
     * @returns Object containing offer message and associated credential record
     *
     */
    createOfferAsResponse(credentialRecord: CredentialRecord, credentialTemplate: CredentialOfferTemplate): Promise<CredentialProtocolMsgReturnType<OfferCredentialMessage>>;
    /**
     * Create a {@link OfferCredentialMessage} not bound to an existing credential exchange.
     * To create an offer as response to an existing credential exchange, use {@link CredentialService#createOfferAsResponse}.
     *
     * @param connectionRecord The connection for which to create the credential offer
     * @param credentialTemplate The credential template to use for the offer
     * @returns Object containing offer message and associated credential record
     *
     */
    createOffer(credentialTemplate: CredentialOfferTemplate, connectionRecord?: ConnectionRecord): Promise<CredentialProtocolMsgReturnType<OfferCredentialMessage>>;
    /**
     * Process a received {@link OfferCredentialMessage}. This will not accept the credential offer
     * or send a credential request. It will only create a new credential record with
     * the information from the credential offer message. Use {@link CredentialService#createRequest}
     * after calling this method to create a credential request.
     *
     * @param messageContext The message context containing a credential request message
     * @returns credential record associated with the credential offer message
     *
     */
    processOffer(messageContext: InboundMessageContext<OfferCredentialMessage>): Promise<CredentialRecord>;
    /**
     * Create a {@link RequestCredentialMessage} as response to a received credential offer.
     *
     * @param credentialRecord The credential record for which to create the credential request
     * @param options Additional configuration to use for the credential request
     * @returns Object containing request message and associated credential record
     *
     */
    createRequest(credentialRecord: CredentialRecord, options: CredentialRequestOptions): Promise<CredentialProtocolMsgReturnType<RequestCredentialMessage>>;
    /**
     * Process a received {@link RequestCredentialMessage}. This will not accept the credential request
     * or send a credential. It will only update the existing credential record with
     * the information from the credential request message. Use {@link CredentialService#createCredential}
     * after calling this method to create a credential.
     *
     * @param messageContext The message context containing a credential request message
     * @returns credential record associated with the credential request message
     *
     */
    processRequest(messageContext: InboundMessageContext<RequestCredentialMessage>): Promise<CredentialRecord>;
    /**
     * Create a {@link IssueCredentialMessage} as response to a received credential request.
     *
     * @param credentialRecord The credential record for which to create the credential
     * @param options Additional configuration to use for the credential
     * @returns Object containing issue credential message and associated credential record
     *
     */
    createCredential(credentialRecord: CredentialRecord, options?: CredentialResponseOptions): Promise<CredentialProtocolMsgReturnType<IssueCredentialMessage>>;
    /**
     * Process a received {@link IssueCredentialMessage}. This will not accept the credential
     * or send a credential acknowledgement. It will only update the existing credential record with
     * the information from the issue credential message. Use {@link CredentialService#createAck}
     * after calling this method to create a credential acknowledgement.
     *
     * @param messageContext The message context containing an issue credential message
     *
     * @returns credential record associated with the issue credential message
     *
     */
    processCredential(messageContext: InboundMessageContext<IssueCredentialMessage>): Promise<CredentialRecord>;
    /**
     * Create a {@link CredentialAckMessage} as response to a received credential.
     *
     * @param credentialRecord The credential record for which to create the credential acknowledgement
     * @returns Object containing credential acknowledgement message and associated credential record
     *
     */
    createAck(credentialRecord: CredentialRecord): Promise<CredentialProtocolMsgReturnType<CredentialAckMessage>>;
    /**
     * Decline a credential offer
     * @param credentialRecord The credential to be declined
     */
    declineOffer(credentialRecord: CredentialRecord): Promise<CredentialRecord>;
    /**
     * Process a received {@link CredentialAckMessage}.
     *
     * @param messageContext The message context containing a credential acknowledgement message
     * @returns credential record associated with the credential acknowledgement message
     *
     */
    processAck(messageContext: InboundMessageContext<CredentialAckMessage>): Promise<CredentialRecord>;
    /**
     * Process a received {@link ProblemReportMessage}.
     *
     * @param messageContext The message context containing a credential problem report message
     * @returns credential record associated with the credential problem report message
     *
     */
    processProblemReport(messageContext: InboundMessageContext<CredentialProblemReportMessage>): Promise<CredentialRecord>;
    /**
     * Retrieve all credential records
     *
     * @returns List containing all credential records
     */
    getAll(): Promise<CredentialRecord[]>;
    /**
     * Retrieve a credential record by id
     *
     * @param credentialRecordId The credential record id
     * @throws {RecordNotFoundError} If no record is found
     * @return The credential record
     *
     */
    getById(credentialRecordId: string): Promise<CredentialRecord>;
    /**
     * Find a credential record by id
     *
     * @param credentialRecordId the credential record id
     * @returns The credential record or null if not found
     */
    findById(connectionId: string): Promise<CredentialRecord | null>;
    /**
     * Delete a credential record by id
     *
     * @param credentialId the credential record id
     */
    deleteById(credentialId: string, options?: DeleteCredentialOptions): Promise<void>;
    /**
     * Retrieve a credential record by connection id and thread id
     *
     * @param connectionId The connection id
     * @param threadId The thread id
     * @throws {RecordNotFoundError} If no record is found
     * @throws {RecordDuplicateError} If multiple records are found
     * @returns The credential record
     */
    getByThreadAndConnectionId(threadId: string, connectionId?: string): Promise<CredentialRecord>;
    update(credentialRecord: CredentialRecord): Promise<void>;
    /**
     * Update the record to a new state and emit an state changed event. Also updates the record
     * in storage.
     *
     * @param credentialRecord The credential record to update the state for
     * @param newState The state to update to
     *
     */
    private updateState;
}

export declare class CredentialsModule {
    private connectionService;
    private credentialService;
    private messageSender;
    private agentConfig;
    private credentialResponseCoordinator;
    private mediationRecipientService;
    private revocationService;
    constructor(dispatcher: Dispatcher, connectionService: ConnectionService, credentialService: CredentialService, messageSender: MessageSender, agentConfig: AgentConfig, credentialResponseCoordinator: CredentialResponseCoordinator, mediationRecipientService: MediationRecipientService, revocationService: RevocationService);
    /**
     * Initiate a new credential exchange as holder by sending a credential proposal message
     * to the connection with the specified connection id.
     *
     * @param connectionId The connection to send the credential proposal to
     * @param config Additional configuration to use for the proposal
     * @returns Credential record associated with the sent proposal message
     */
    proposeCredential(connectionId: string, config?: CredentialProposeOptions): Promise<CredentialRecord>;
    /**
     * Accept a credential proposal as issuer (by sending a credential offer message) to the connection
     * associated with the credential record.
     *
     * @param credentialRecordId The id of the credential record for which to accept the proposal
     * @param config Additional configuration to use for the offer
     * @returns Credential record associated with the credential offer
     *
     */
    acceptProposal(credentialRecordId: string, config?: {
        comment?: string;
        credentialDefinitionId?: string;
        autoAcceptCredential?: AutoAcceptCredential;
    }): Promise<CredentialRecord>;
    /**
     * Negotiate a credential proposal as issuer (by sending a credential offer message) to the connection
     * associated with the credential record.
     *
     * @param credentialRecordId The id of the credential record for which to accept the proposal
     * @param preview The new preview for negotiation
     * @param config Additional configuration to use for the offer
     * @returns Credential record associated with the credential offer
     *
     */
    negotiateProposal(credentialRecordId: string, preview: CredentialPreview, config?: {
        comment?: string;
        credentialDefinitionId?: string;
        autoAcceptCredential?: AutoAcceptCredential;
    }): Promise<CredentialRecord>;
    /**
     * Initiate a new credential exchange as issuer by sending a credential offer message
     * to the connection with the specified connection id.
     *
     * @param connectionId The connection to send the credential offer to
     * @param credentialTemplate The credential template to use for the offer
     * @returns Credential record associated with the sent credential offer message
     */
    offerCredential(connectionId: string, credentialTemplate: CredentialOfferTemplate): Promise<CredentialRecord>;
    /**
     * Initiate a new credential exchange as issuer by creating a credential offer
     * not bound to any connection. The offer must be delivered out-of-band to the holder
     *
     * @param credentialTemplate The credential template to use for the offer
     * @returns The credential record and credential offer message
     */
    createOutOfBandOffer(credentialTemplate: CredentialOfferTemplate): Promise<{
        offerMessage: OfferCredentialMessage;
        credentialRecord: CredentialRecord;
    }>;
    /**
     * Accept a credential offer as holder (by sending a credential request message) to the connection
     * associated with the credential record.
     *
     * @param credentialRecordId The id of the credential record for which to accept the offer
     * @param config Additional configuration to use for the request
     * @returns Credential record associated with the sent credential request message
     *
     */
    acceptOffer(credentialRecordId: string, config?: {
        comment?: string;
        autoAcceptCredential?: AutoAcceptCredential;
    }): Promise<CredentialRecord>;
    /**
     * Declines an offer as holder
     * @param credentialRecordId the id of the credential to be declined
     * @returns credential record that was declined
     */
    declineOffer(credentialRecordId: string): Promise<CredentialRecord>;
    /**
     * Negotiate a credential offer as holder (by sending a credential proposal message) to the connection
     * associated with the credential record.
     *
     * @param credentialRecordId The id of the credential record for which to accept the offer
     * @param preview The new preview for negotiation
     * @param config Additional configuration to use for the request
     * @returns Credential record associated with the sent credential request message
     *
     */
    negotiateOffer(credentialRecordId: string, preview: CredentialPreview, config?: {
        comment?: string;
        autoAcceptCredential?: AutoAcceptCredential;
    }): Promise<CredentialRecord>;
    /**
     * Accept a credential request as issuer (by sending a credential message) to the connection
     * associated with the credential record.
     *
     * @param credentialRecordId The id of the credential record for which to accept the request
     * @param config Additional configuration to use for the credential
     * @returns Credential record associated with the sent presentation message
     *
     */
    acceptRequest(credentialRecordId: string, config?: {
        comment?: string;
        autoAcceptCredential?: AutoAcceptCredential;
    }): Promise<CredentialRecord>;
    /**
     * Accept a credential as holder (by sending a credential acknowledgement message) to the connection
     * associated with the credential record.
     *
     * @param credentialRecordId The id of the credential record for which to accept the credential
     * @returns credential record associated with the sent credential acknowledgement message
     *
     */
    acceptCredential(credentialRecordId: string): Promise<CredentialRecord>;
    /**
     * Send problem report message for a credential record
     * @param credentialRecordId  The id of the credential record for which to send problem report
     * @param message message to send
     * @returns credential record associated with credential problem report message
     */
    sendProblemReport(credentialRecordId: string, message: string): Promise<CredentialRecord>;
    /**
     * Retrieve all credential records
     *
     * @returns List containing all credential records
     */
    getAll(): Promise<CredentialRecord[]>;
    /**
     * Retrieve a credential record by id
     *
     * @param credentialRecordId The credential record id
     * @throws {RecordNotFoundError} If no record is found
     * @return The credential record
     *
     */
    getById(credentialRecordId: string): Promise<CredentialRecord>;
    /**
     * Find a credential record by id
     *
     * @param credentialRecordId the credential record id
     * @returns The credential record or null if not found
     */
    findById(connectionId: string): Promise<CredentialRecord | null>;
    /**
     * Delete a credential record by id
     *
     * @param credentialId the credential record id
     */
    deleteById(credentialId: string, options?: {
        deleteAssociatedCredential: boolean;
    }): Promise<void>;
    private registerHandlers;
}

/**
 * Issue Credential states as defined in RFC 0036
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#states
 */
export declare enum CredentialState {
    ProposalSent = "proposal-sent",
    ProposalReceived = "proposal-received",
    OfferSent = "offer-sent",
    OfferReceived = "offer-received",
    Declined = "declined",
    RequestSent = "request-sent",
    RequestReceived = "request-received",
    CredentialIssued = "credential-issued",
    CredentialReceived = "credential-received",
    Done = "done"
}

export declare interface CredentialStateChangedEvent extends BaseEvent {
    type: typeof CredentialEventTypes.CredentialStateChanged;
    payload: {
        credentialRecord: CredentialRecord;
        previousState: CredentialState | null;
    };
}

export declare class CredentialUtils {
    /**
     * Adds attribute(s) to the credential preview that is linked to the given attachment(s)
     *
     * @param attachments a list of the attachments that need to be linked to a credential
     * @param preview the credential previews where the new linked credential has to be appended to
     *
     * @returns a modified version of the credential preview with the linked credentials
     * */
    static createAndLinkAttachmentsToPreview(attachments: LinkedAttachment[], preview: CredentialPreview): CredentialPreview;
    /**
     * Converts int value to string
     * Converts string value:
     * - hash with sha256,
     * - convert to byte array and reverse it
     * - convert it to BigInteger and return as a string
     * @param attributes
     *
     * @returns CredValues
     */
    static convertAttributesToValues(attributes: CredentialPreviewAttribute[]): CredValues;
    /**
     * Check whether the values of two credentials match (using {@link assertValuesMatch})
     *
     * @returns a boolean whether the values are equal
     *
     */
    static checkValuesMatch(firstValues: CredValues, secondValues: CredValues): boolean;
    /**
     * Assert two credential values objects match.
     *
     * @param firstValues The first values object
     * @param secondValues The second values object
     *
     * @throws If not all values match
     */
    static assertValuesMatch(firstValues: CredValues, secondValues: CredValues): void;
    /**
     * Check whether the raw value matches the encoded version according to the encoding format described in Aries RFC 0037
     * Use this method to ensure the received proof (over the encoded) value is the same as the raw value of the data.
     *
     * @param raw
     * @param encoded
     * @returns Whether raw and encoded value match
     *
     * @see https://github.com/hyperledger/aries-framework-dotnet/blob/a18bef91e5b9e4a1892818df7408e2383c642dfa/src/Hyperledger.Aries/Utils/CredentialUtils.cs#L78-L89
     * @see https://github.com/hyperledger/aries-rfcs/blob/be4ad0a6fb2823bb1fc109364c96f077d5d8dffa/features/0037-present-proof/README.md#verifying-claims-of-indy-based-verifiable-credentials
     */
    static checkValidEncoding(raw: unknown, encoded: string): boolean;
    /**
     * Encode value according to the encoding format described in Aries RFC 0036/0037
     *
     * @param value
     * @returns Encoded version of value
     *
     * @see https://github.com/hyperledger/aries-cloudagent-python/blob/0000f924a50b6ac5e6342bff90e64864672ee935/aries_cloudagent/messaging/util.py#L106-L136
     * @see https://github.com/hyperledger/aries-rfcs/blob/be4ad0a6fb2823bb1fc109364c96f077d5d8dffa/features/0037-present-proof/README.md#verifying-claims-of-indy-based-verifiable-credentials
     * @see https://github.com/hyperledger/aries-rfcs/blob/be4ad0a6fb2823bb1fc109364c96f077d5d8dffa/features/0036-issue-credential/README.md#encoding-claims-for-indy-based-verifiable-credentials
     */
    static encode(value: unknown): string;
    private static isInt32;
    static checkAttributesMatch(schema: Schema, credentialPreview: CredentialPreview): void;
}

export declare type CustomBasicMessageTags = TagsBase;

declare type CustomCacheTags = TagsBase;

export declare type CustomConnectionTags = TagsBase;

export declare type CustomCredentialTags = TagsBase;

declare interface CustomDidTags extends TagsBase {
    recipientKeys?: string[];
}

export declare type CustomMediationTags = {
    default?: boolean;
};

export declare type CustomProofTags = TagsBase;

declare interface DecryptedMessageContext {
    plaintextMessage: PlaintextMessage;
    senderKey?: string;
    recipientKey?: string;
}

export declare type DefaultBasicMessageTags = {
    connectionId: string;
    role: BasicMessageRole;
};

declare type DefaultCacheTags = TagsBase;

export declare type DefaultConnectionTags = {
    state: ConnectionState;
    role: ConnectionRole;
    invitationKey?: string;
    threadId?: string;
    verkey?: string;
    theirKey?: string;
    mediatorId?: string;
    did: string;
    theirDid?: string;
};

export declare type DefaultCredentialTags = {
    threadId: string;
    connectionId?: string;
    state: CredentialState;
    credentialId?: string;
    indyRevocationRegistryId?: string;
    indyCredentialRevocationId?: string;
};

declare type DefaultDidTags = {
    role: DidDocumentRole;
    method: string;
};

export declare type DefaultMediationTags = {
    role: MediationRole;
    connectionId: string;
    state: MediationState;
    threadId: string;
};

export declare type DefaultProofTags = {
    threadId: string;
    connectionId?: string;
    state: ProofState;
};

export declare interface DeleteCredentialOptions {
    deleteAssociatedCredential: boolean;
}

export declare class DeliveryRequestMessage extends AgentMessage {
    constructor(options: DeliveryRequestMessageOptions);
    readonly type = "https://didcomm.org/messagepickup/2.0/delivery-request";
    static readonly type = "https://didcomm.org/messagepickup/2.0/delivery-request";
    recipientKey?: string;
    limit: number;
}

export declare interface DeliveryRequestMessageOptions {
    id?: string;
    recipientKey?: string;
    limit: number;
}

declare interface DescriptionOptions {
    en: string;
    code: string;
}

export declare const DID_POOL_CACHE_ID = "DID_POOL_CACHE";

export declare const DID_POOL_CACHE_LIMIT = 500;

export declare enum DidCommMimeType {
    V0 = "application/ssi-agent-wire",
    V1 = "application/didcomm-envelope-enc"
}

declare class DidCommService extends DidDocumentService {
    constructor(options: {
        id: string;
        serviceEndpoint: string;
        recipientKeys: string[];
        routingKeys?: string[];
        accept?: string[];
        priority?: number;
    });
    static type: string;
    recipientKeys: string[];
    routingKeys?: string[];
    accept?: string[];
    priority: number;
}

declare interface DidConfig {
    seed?: string;
}

export declare class DidDoc {
    context: string;
    id: string;
    publicKey: PublicKey[];
    service: DidDocumentService[];
    authentication: Authentication[];
    constructor(options: DidDocOptions);
    /**
     * Gets the matching public key for a given key id
     *
     * @param id fully qualified key id
     */
    getPublicKey(id: string): PublicKey | undefined;
    /**
     * Returns all of the service endpoints matching the given type.
     *
     * @param type The type of service(s) to query.
     */
    getServicesByType<S extends DidDocumentService = DidDocumentService>(type: string): S[];
    /**
     * Returns all of the service endpoints matching the given class
     *
     * @param classType The class to query services.
     */
    getServicesByClassType<S extends DidDocumentService = DidDocumentService>(classType: new (...args: never[]) => S): S[];
    /**
     * Get all DIDComm services ordered by priority descending. This means the highest
     * priority will be the first entry.
     */
    get didCommServices(): Array<IndyAgentService | DidCommService>;
}

declare type DidDocOptions = Pick<DidDoc, 'id' | 'publicKey' | 'service' | 'authentication'>;

declare class DidDocument {
    context: string[];
    id: string;
    alsoKnownAs: string[];
    controller: string[];
    verificationMethod: VerificationMethod[];
    service: DidDocumentService[];
    authentication: Array<string | VerificationMethod>;
    assertionMethod: Array<string | VerificationMethod>;
    keyAgreement: Array<string | VerificationMethod>;
    capabilityInvocation: Array<string | VerificationMethod>;
    capabilityDelegation: Array<string | VerificationMethod>;
    constructor(options: DidDocumentOptions);
    dereferenceKey(keyId: string): VerificationMethod;
    /**
     * Returns all of the service endpoints matching the given type.
     *
     * @param type The type of service(s) to query.
     */
    getServicesByType<S extends DidDocumentService = DidDocumentService>(type: string): S[];
    /**
     * Returns all of the service endpoints matching the given class
     *
     * @param classType The class to query services.
     */
    getServicesByClassType<S extends DidDocumentService = DidDocumentService>(classType: new (...args: never[]) => S): S[];
    /**
     * Get all DIDComm services ordered by priority descending. This means the highest
     * priority will be the first entry.
     */
    get didCommServices(): Array<IndyAgentService | DidCommService>;
    get recipientKeys(): string[];
    toJSON(): Record<string, any>;
}

declare type DidDocumentMetadata = DIDDocumentMetadata;

declare interface DidDocumentOptions {
    context?: string[];
    id: string;
    alsoKnownAs?: string[];
    controller?: string[];
    verificationMethod?: VerificationMethod[];
    service?: DidDocumentService[];
    authentication?: Array<string | VerificationMethod>;
    assertionMethod?: Array<string | VerificationMethod>;
    keyAgreement?: Array<string | VerificationMethod>;
    capabilityInvocation?: Array<string | VerificationMethod>;
    capabilityDelegation?: Array<string | VerificationMethod>;
}

declare enum DidDocumentRole {
    Created = "created",
    Received = "received"
}

declare class DidDocumentService {
    constructor(options: {
        id: string;
        serviceEndpoint: string;
        type: string;
    });
    get protocolScheme(): string;
    id: string;
    serviceEndpoint: string;
    type: string;
}

declare interface DidInfo {
    did: string;
    verkey: string;
}

export declare interface DIDInvitationOptions {
    did: string;
}

declare class DidRecord extends BaseRecord<DefaultDidTags, CustomDidTags> implements DidRecordProps {
    didDocument?: DidDocument;
    role: DidDocumentRole;
    static readonly type = "DidDocumentRecord";
    readonly type = "DidDocumentRecord";
    constructor(props: DidRecordProps);
    getTags(): {
        role: DidDocumentRole;
        method: string;
        recipientKeys?: string[] | undefined;
    };
}

declare interface DidRecordProps {
    id: string;
    role: DidDocumentRole;
    didDocument?: DidDocument;
    createdAt?: Date;
    tags?: CustomDidTags;
}

declare class DidRepository extends Repository<DidRecord> {
    constructor(storageService: StorageService<DidRecord>);
    findByVerkey(verkey: string): Promise<DidRecord | null>;
}

declare interface DidResolutionMetadata extends DIDResolutionMetadata {
    message?: string;
}

declare type DidResolutionOptions = DIDResolutionOptions;

declare interface DidResolutionResult {
    didResolutionMetadata: DidResolutionMetadata;
    didDocument: DidDocument | null;
    didDocumentMetadata: DidDocumentMetadata;
}

declare class DidResolverService {
    private logger;
    private resolvers;
    constructor(agentConfig: AgentConfig, indyLedgerService: IndyLedgerService, didRepository: DidRepository);
    resolve(didUrl: string, options?: DidResolutionOptions): Promise<DidResolutionResult>;
    private findResolver;
}

declare class DidsModule {
    private resolverService;
    constructor(resolverService: DidResolverService);
    resolve(didUrl: string, options?: DidResolutionOptions): Promise<DidResolutionResult>;
}

declare class DiscloseMessage extends AgentMessage {
    constructor(options: DiscoverFeaturesDiscloseMessageOptions);
    readonly type = "https://didcomm.org/discover-features/1.0/disclose";
    static readonly type = "https://didcomm.org/discover-features/1.0/disclose";
    protocols: DiscloseProtocol[];
}

declare class DiscloseProtocol {
    constructor(options: DiscloseProtocolOptions);
    protocolId: string;
    roles?: string[];
}

declare interface DiscloseProtocolOptions {
    protocolId: string;
    roles?: string[];
}

declare interface DiscoverFeaturesDiscloseMessageOptions {
    id?: string;
    threadId: string;
    protocols: DiscloseProtocolOptions[];
}

declare class DiscoverFeaturesModule {
    private connectionService;
    private messageSender;
    private discoverFeaturesService;
    private eventEmitter;
    private agentConfig;
    constructor(dispatcher: Dispatcher, connectionService: ConnectionService, messageSender: MessageSender, discoverFeaturesService: DiscoverFeaturesService, eventEmitter: EventEmitter, agentConfig: AgentConfig);
    isProtocolSupported(connectionId: string, message: BaseMessage): Promise<unknown>;
    queryFeatures(connectionId: string, options: {
        query: string;
        comment?: string;
    }): Promise<void>;
    private registerHandlers;
}

declare interface DiscoverFeaturesQueryMessageOptions {
    id?: string;
    query: string;
    comment?: string;
}

declare class DiscoverFeaturesService {
    private dispatcher;
    constructor(dispatcher: Dispatcher);
    createQuery(options: {
        query: string;
        comment?: string;
    }): Promise<QueryMessage>;
    createDisclose(queryMessage: QueryMessage): Promise<DiscloseMessage>;
}

export declare class Dispatcher {
    private handlers;
    private messageSender;
    private eventEmitter;
    private logger;
    constructor(messageSender: MessageSender, eventEmitter: EventEmitter, agentConfig: AgentConfig);
    registerHandler(handler: Handler): void;
    dispatch(messageContext: InboundMessageContext): Promise<void>;
    private getHandlerForType;
    getMessageClassForType(messageType: string): typeof AgentMessage | undefined;
    /**
     * Returns array of message types that dispatcher is able to handle.
     * Message type format is MTURI specified at https://github.com/hyperledger/aries-rfcs/blob/main/concepts/0003-protocols/README.md#mturi.
     */
    get supportedMessageTypes(): string[];
    /**
     * Returns array of protocol IDs that dispatcher is able to handle.
     * Protocol ID format is PIURI specified at https://github.com/hyperledger/aries-rfcs/blob/main/concepts/0003-protocols/README.md#piuri.
     */
    get supportedProtocols(): string[];
    filterSupportedProtocolsByMessageFamilies(messageFamilies: string[]): string[];
}

export declare class Ed25119Sig2018 extends PublicKey {
    constructor(options: {
        id: string;
        controller: string;
        publicKeyBase58: string;
    });
    type: "Ed25519VerificationKey2018";
    value: string;
}

export declare class EddsaSaSigSecp256k1 extends PublicKey {
    constructor(options: {
        id: string;
        controller: string;
        publicKeyHex: string;
    });
    type: "Secp256k1VerificationKey2018";
    value: string;
}

export declare class EmbeddedAuthentication extends Authentication {
    publicKey: PublicKey;
    constructor(publicKey: PublicKey);
}

export declare type EncryptedMessage = {
    protected: unknown;
    iv: unknown;
    ciphertext: unknown;
    tag: unknown;
};

declare interface EnvelopeKeys {
    recipientKeys: string[];
    routingKeys: string[];
    senderKey: string | null;
}

declare class EnvelopeService {
    private wallet;
    private logger;
    private config;
    constructor(wallet: Wallet, agentConfig: AgentConfig);
    packMessage(payload: AgentMessage, keys: EnvelopeKeys): Promise<EncryptedMessage>;
    unpackMessage(encryptedMessage: EncryptedMessage): Promise<DecryptedMessageContext>;
}

export declare class EventEmitter {
    private agentConfig;
    private eventEmitter;
    constructor(agentConfig: AgentConfig);
    emit<T extends BaseEvent>(data: T): void;
    on<T extends BaseEvent>(event: T['type'], listener: (data: T) => void | Promise<void>): void;
    off<T extends BaseEvent>(event: T['type'], listener: (data: T) => void | Promise<void>): void;
    observable<T extends BaseEvent>(event: T['type']): Observable<T>;
}

export declare interface FileSystem {
    readonly basePath: string;
    exists(path: string): Promise<boolean>;
    write(path: string, data: string): Promise<void>;
    read(path: string): Promise<string>;
    downloadToFile(url: string, path: string): Promise<void>;
}

declare interface FixHintOptions {
    en: string;
}

/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/concepts/0094-cross-domain-messaging/README.md#corerouting10forward
 */
export declare class ForwardMessage extends AgentMessage {
    /**
     * Create new ForwardMessage instance.
     *
     * @param options
     */
    constructor(options: ForwardMessageOptions);
    readonly type = "https://didcomm.org/routing/1.0/forward";
    static readonly type = "https://didcomm.org/routing/1.0/forward";
    to: string;
    message: EncryptedMessage;
}

export declare interface ForwardMessageOptions {
    id?: string;
    to: string;
    message: EncryptedMessage;
}

declare interface GetCredentialForProofRequestOptions {
    proofRequest: Indy.IndyProofRequest;
    attributeReferent: string;
    start?: number;
    limit?: number;
    extraQuery?: Indy.ReferentWalletQuery;
}

/**
 * Extract directory from path (should also work with windows paths)
 *
 * @param path the path to extract the directory from
 * @returns the directory path
 */
export declare function getDirFromFilePath(path: string): string;

export declare interface GetRequestedCredentialsConfig {
    /**
     * Whether to filter the retrieved credentials using the presentation preview.
     * This configuration will only have effect if a presentation proposal message is available
     * containing a presentation preview.
     *
     * @default false
     */
    filterByPresentationPreview?: boolean;
    /**
     * Whether to filter the retrieved credentials using the non-revocation request in the proof request.
     * This configuration will only have effect if the proof request requires proof on non-revocation of any kind.
     * Default to true
     *
     * @default true
     */
    filterByNonRevocationRequirements?: boolean;
}

export declare interface GetRoutingOptions {
    /**
     * Identifier of the mediator to use when setting up routing
     */
    mediatorId?: string;
    /**
     * Whether to use the default mediator if available and `mediatorId` has not been provided
     * @default true
     */
    useDefaultMediator?: boolean;
}

export declare interface Handler<T extends typeof AgentMessage = typeof AgentMessage> {
    readonly supportedMessages: readonly T[];
    handle(messageContext: InboundMessageContext): Promise<OutboundMessage | OutboundServiceMessage | void>;
}

/**
 * Provides exact typing for the AgentMessage in the message context in the `handle` function
 * of a handler. It takes all possible types from `supportedMessageTypes`
 *
 * @example
 * async handle(messageContext: HandlerInboundMessage<BasicMessageHandler>) {}
 */
export declare type HandlerInboundMessage<H extends Handler> = InboundMessageContext<InstanceType<H['supportedMessages'][number]>>;

export declare class HttpOutboundTransport implements OutboundTransport {
    private agent;
    private logger;
    private agentConfig;
    private fetch;
    supportedSchemes: string[];
    start(agent: Agent): Promise<void>;
    stop(): Promise<void>;
    sendMessage(outboundPackage: OutboundPackage): Promise<void>;
}

declare enum ImpactStatus {
    Message = "MESSAGE",
    Thread = "THREAD",
    Connection = "CONNECTION"
}

export declare class InboundMessageContext<T extends AgentMessage = AgentMessage> {
    message: T;
    connection?: ConnectionRecord;
    senderVerkey?: string;
    recipientVerkey?: string;
    sessionId?: string;
    constructor(message: T, context?: MessageContextParams);
    /**
     * Assert the inbound message has a ready connection associated with it.
     *
     * @throws {AriesFrameworkError} if there is no connection or the connection is not ready
     */
    assertReadyConnection(): ConnectionRecord;
}

export declare interface InboundTransport {
    start(agent: Agent): Promise<void>;
    stop(): Promise<void>;
}

export declare const INDY_CREDENTIAL_ATTACHMENT_ID = "libindy-cred-0";

export declare const INDY_CREDENTIAL_OFFER_ATTACHMENT_ID = "libindy-cred-offer-0";

export declare const INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID = "libindy-cred-request-0";

export declare const INDY_PROOF_ATTACHMENT_ID = "libindy-presentation-0";

export declare const INDY_PROOF_REQUEST_ATTACHMENT_ID = "libindy-request-presentation-0";

declare class IndyAgentService extends DidDocumentService {
    constructor(options: {
        id: string;
        serviceEndpoint: string;
        recipientKeys: string[];
        routingKeys?: string[];
        priority?: number;
    });
    static type: string;
    recipientKeys: string[];
    routingKeys?: string[];
    priority: number;
}

export declare class IndyCredentialInfo {
    constructor(options: IndyCredentialInfo);
    /**
     * Credential ID in the wallet
     */
    referent: string;
    attributes: Record<string, string>;
    schemaId: string;
    credentialDefinitionId: string;
    revocationRegistryId?: string;
    credentialRevocationId?: string;
    toJSON(): IndyCredentialInfo_2;
}

declare interface IndyCredentialMetadata {
    credentialDefinitionId?: string;
    schemaId?: string;
}

export declare interface IndyEndpointAttrib {
    endpoint?: string;
    types?: Array<'endpoint' | 'did-communication' | 'DIDComm'>;
    routingKeys?: string[];
    [key: string]: unknown;
}

declare interface IndyError {
    name: 'IndyError';
    message: string;
    indyName?: string;
}

declare class IndyHolderService {
    private indy;
    private logger;
    private wallet;
    private indyRevocationService;
    constructor(agentConfig: AgentConfig, indyRevocationService: IndyRevocationService, wallet: IndyWallet);
    /**
     * Creates an Indy Proof in response to a proof request. Will create revocation state if the proof request requests proof of non-revocation
     *
     * @param proofRequest a Indy proof request
     * @param requestedCredentials the requested credentials to use for the proof creation
     * @param schemas schemas to use in proof creation
     * @param credentialDefinitions credential definitions to use in proof creation
     * @throws {Error} if there is an error during proof generation or revocation state generation
     * @returns a promise of Indy Proof
     *
     * @todo support attribute non_revoked fields
     */
    createProof({ proofRequest, requestedCredentials, schemas, credentialDefinitions, }: CreateProofOptions): Promise<Indy.IndyProof>;
    /**
     * Store a credential in the wallet.
     *
     * @returns The credential id
     */
    storeCredential({ credentialRequestMetadata, credential, credentialDefinition, credentialId, revocationRegistryDefinition, }: StoreCredentialOptions): Promise<Indy.CredentialId>;
    /**
     * Get a credential stored in the wallet by id.
     *
     * @param credentialId the id (referent) of the credential
     * @throws {Error} if the credential is not found
     * @returns the credential
     *
     * @todo handle record not found
     */
    getCredential(credentialId: Indy.CredentialId): Promise<Indy.IndyCredentialInfo>;
    /**
     * Create a credential request for the given credential offer.
     *
     * @returns The credential request and the credential request metadata
     */
    createCredentialRequest({ holderDid, credentialOffer, credentialDefinition, }: CreateCredentialRequestOptions): Promise<[Indy.CredReq, Indy.CredReqMetadata]>;
    /**
     * Retrieve the credentials that are available for an attribute referent in the proof request.
     *
     * @param proofRequest The proof request to retrieve the credentials for
     * @param attributeReferent An attribute referent from the proof request to retrieve the credentials for
     * @param start Starting index
     * @param limit Maximum number of records to return
     *
     * @returns List of credentials that are available for building a proof for the given proof request
     *
     */
    getCredentialsForProofRequest({ proofRequest, attributeReferent, start, limit, extraQuery, }: GetCredentialForProofRequestOptions): Promise<Indy.IndyCredential[]>;
    /**
     * Delete a credential stored in the wallet by id.
     *
     * @param credentialId the id (referent) of the credential
     *
     */
    deleteCredential(credentialId: Indy.CredentialId): Promise<void>;
    private fetchCredentialsForReferent;
}

declare class IndyIssuerService {
    private indy;
    private wallet;
    private indyUtilitiesService;
    private fileSystem;
    constructor(agentConfig: AgentConfig, wallet: IndyWallet, indyUtilitiesService: IndyUtilitiesService);
    /**
     * Create a new credential schema.
     *
     * @returns the schema.
     */
    createSchema({ originDid, name, version, attributes }: CreateSchemaOptions): Promise<Schema>;
    /**
     * Create a new credential definition and store it in the wallet.
     *
     * @returns the credential definition.
     */
    createCredentialDefinition({ issuerDid, schema, tag, signatureType, supportRevocation, }: CreateCredentialDefinitionOptions): Promise<CredDef>;
    /**
     * Create a credential offer for the given credential definition id.
     *
     * @param credentialDefinitionId The credential definition to create an offer for
     * @returns The created credential offer
     */
    createCredentialOffer(credentialDefinitionId: CredDefId): Promise<default_2.CredOffer>;
    /**
     * Create a credential.
     *
     * @returns Credential and revocation id
     */
    createCredential({ credentialOffer, credentialRequest, credentialValues, revocationRegistryId, tailsFilePath, }: CreateCredentialOptions): Promise<[Cred, CredRevocId]>;
}

export declare class IndyLedgerService {
    private wallet;
    private indy;
    private logger;
    private indyIssuer;
    private indyPoolService;
    constructor(wallet: IndyWallet, agentConfig: AgentConfig, indyIssuer: IndyIssuerService, indyPoolService: IndyPoolService);
    connectToPools(): Promise<number[]>;
    registerPublicDid(submitterDid: string, targetDid: string, verkey: string, alias: string, role?: NymRole): Promise<string>;
    getPublicDid(did: string): Promise<default_2.GetNymResponse>;
    getEndpointsForDid(did: string): Promise<IndyEndpointAttrib>;
    registerSchema(did: string, schemaTemplate: SchemaTemplate): Promise<Schema>;
    getSchema(schemaId: string): Promise<default_2.Schema>;
    registerCredentialDefinition(did: string, credentialDefinitionTemplate: CredentialDefinitionTemplate): Promise<CredDef>;
    getCredentialDefinition(credentialDefinitionId: string): Promise<default_2.CredDef>;
    getRevocationRegistryDefinition(revocationRegistryDefinitionId: string): Promise<ParseRevocationRegistryDefitinionTemplate>;
    getRevocationRegistryDelta(revocationRegistryDefinitionId: string, to?: number, from?: number): Promise<ParseRevocationRegistryDeltaTemplate>;
    getRevocationRegistry(revocationRegistryDefinitionId: string, timestamp: number): Promise<ParseRevocationRegistryTemplate>;
    private submitWriteRequest;
    private submitReadRequest;
    private signRequest;
    private appendTaa;
    private getTransactionAuthorAgreement;
    private getFirstAcceptanceMechanism;
}

export declare class IndyPool {
    private indy;
    private logger;
    private fileSystem;
    private poolConfig;
    private _poolHandle?;
    private poolConnected?;
    authorAgreement?: AuthorAgreement | null;
    constructor(agentConfig: AgentConfig, poolConfig: IndyPoolConfig);
    get id(): string;
    get config(): IndyPoolConfig;
    close(): Promise<void>;
    delete(): Promise<void>;
    connect(): Promise<number>;
    private connectToLedger;
    private submitRequest;
    submitReadRequest(request: Indy.LedgerRequest): Promise<Indy.LedgerReadReplyResponse>;
    submitWriteRequest(request: Indy.LedgerRequest): Promise<Indy.LedgerWriteReplyResponse>;
    private getPoolHandle;
    private getGenesisPath;
}

export declare interface IndyPoolConfig {
    genesisPath?: string;
    genesisTransactions?: string;
    id: string;
    isProduction: boolean;
}

export declare class IndyPoolService {
    readonly pools: IndyPool[];
    private logger;
    private indy;
    private didCache;
    constructor(agentConfig: AgentConfig, cacheRepository: CacheRepository);
    /**
     * Create connections to all ledger pools
     */
    connectToPools(): Promise<number[]>;
    /**
     * Get the pool used for writing to the ledger. For now we always use the first pool
     *  as the pool that writes to the ledger
     */
    get ledgerWritePool(): IndyPool;
    /**
     * Get the most appropriate pool for the given did. The algorithm is based on the approach as described in this document:
     * https://docs.google.com/document/d/109C_eMsuZnTnYe2OAd02jAts1vC4axwEKIq7_4dnNVA/edit
     */
    getPoolForDid(did: string): Promise<{
        pool: IndyPool;
        did: Indy.GetNymResponse;
    }>;
    private getSettledDidResponsesFromPools;
    private getDidFromPool;
}

declare class IndyRevocationService {
    private indy;
    private indyUtilitiesService;
    private fileSystem;
    private ledgerService;
    private logger;
    private wallet;
    constructor(agentConfig: AgentConfig, indyUtilitiesService: IndyUtilitiesService, ledgerService: IndyLedgerService, wallet: IndyWallet);
    createRevocationState(proofRequest: default_2.IndyProofRequest, requestedCredentials: RequestedCredentials): Promise<default_2.RevStates>;
    getRevocationStatus(credentialRevocationId: string, revocationRegistryDefinitionId: string, requestRevocationInterval: RevocationInterval): Promise<{
        revoked: boolean;
        deltaTimestamp: number;
    }>;
    private assertRevocationInterval;
}

export declare class IndySdkError extends AriesFrameworkError {
    constructor(indyError: IndyError, message?: string);
}

declare class IndyUtilitiesService {
    private indy;
    private logger;
    private fileSystem;
    constructor(agentConfig: AgentConfig);
    /**
     * Get a handler for the blob storage tails file reader.
     *
     * @param tailsFilePath The path of the tails file
     * @returns The blob storage reader handle
     */
    createTailsReader(tailsFilePath: string): Promise<BlobReaderHandle>;
    downloadTails(hash: string, tailsLocation: string): Promise<BlobReaderHandle>;
}

declare class IndyVerifierService {
    private indy;
    private ledgerService;
    constructor(agentConfig: AgentConfig, ledgerService: IndyLedgerService);
    verifyProof({ proofRequest, proof, schemas, credentialDefinitions, }: VerifyProofOptions): Promise<boolean>;
    private getRevocationRegistries;
}

declare class IndyWallet implements Wallet {
    private walletConfig?;
    private walletHandle?;
    private logger;
    private publicDidInfo;
    private indy;
    constructor(agentConfig: AgentConfig);
    get isProvisioned(): boolean;
    get isInitialized(): boolean;
    get publicDid(): DidInfo | undefined;
    get handle(): number;
    get masterSecretId(): string;
    /**
     * @throws {WalletDuplicateError} if the wallet already exists
     * @throws {WalletError} if another error occurs
     */
    create(walletConfig: WalletConfig): Promise<void>;
    /**
     * @throws {WalletDuplicateError} if the wallet already exists
     * @throws {WalletError} if another error occurs
     */
    createAndOpen(walletConfig: WalletConfig): Promise<void>;
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    open(walletConfig: WalletConfig): Promise<void>;
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    rotateKey(walletConfig: WalletConfigRekey): Promise<void>;
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    private _open;
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    delete(): Promise<void>;
    export(exportConfig: WalletExportImportConfig): Promise<void>;
    import(walletConfig: WalletConfig, importConfig: WalletExportImportConfig): Promise<void>;
    /**
     * @throws {WalletError} if the wallet is already closed or another error occurs
     */
    close(): Promise<void>;
    /**
     * Create master secret with specified id in currently opened wallet.
     *
     * If a master secret by this id already exists in the current wallet, the method
     * will return without doing anything.
     *
     * @throws {WalletError} if an error occurs
     */
    private createMasterSecret;
    initPublicDid(didConfig: DidConfig): Promise<void>;
    createDid(didConfig?: DidConfig): Promise<DidInfo>;
    pack(payload: Record<string, unknown>, recipientKeys: string[], senderVerkey?: string): Promise<EncryptedMessage>;
    unpack(messagePackage: EncryptedMessage): Promise<DecryptedMessageContext>;
    sign(data: Buffer_2, verkey: string): Promise<Buffer_2>;
    verify(signerVerkey: string, data: Buffer_2, signature: Buffer_2): Promise<boolean>;
    generateNonce(): Promise<string>;
}

export declare interface InitConfig {
    endpoints?: string[];
    label: string;
    publicDidSeed?: string;
    mediatorRecordId?: string;
    walletConfig?: WalletConfig;
    autoAcceptConnections?: boolean;
    autoAcceptProofs?: AutoAcceptProof;
    autoAcceptCredentials?: AutoAcceptCredential;
    logger?: Logger;
    didCommMimeType?: DidCommMimeType;
    indyLedgers?: IndyPoolConfig[];
    connectToIndyLedgersOnStartup?: boolean;
    autoAcceptMediationRequests?: boolean;
    mediatorConnectionsInvite?: string;
    defaultMediatorId?: string;
    clearDefaultMediator?: boolean;
    mediatorPollingInterval?: number;
    mediatorPickupStrategy?: MediatorPickupStrategy;
    maximumMessagePickup?: number;
    useLegacyDidSovPrefix?: boolean;
    connectionImageUrl?: string;
    autoUpdateStorageOnStartup?: boolean;
}

export declare const InjectionSymbols: {
    Wallet: symbol;
    MessageRepository: symbol;
    StorageService: symbol;
    Logger: symbol;
};

export declare interface InlineInvitationOptions {
    recipientKeys: string[];
    serviceEndpoint: string;
    routingKeys?: string[];
}

export declare class InMemoryMessageRepository implements MessageRepository {
    private logger;
    private messages;
    constructor(agentConfig: AgentConfig);
    takeFromQueue(connectionId: string, limit?: number): EncryptedMessage[];
    add(connectionId: string, payload: EncryptedMessage): void;
}

export declare class IssueCredentialMessage extends AgentMessage {
    constructor(options: IssueCredentialMessageOptions);
    readonly type = "https://didcomm.org/issue-credential/1.0/issue-credential";
    static readonly type = "https://didcomm.org/issue-credential/1.0/issue-credential";
    comment?: string;
    credentialAttachments: Attachment[];
    get indyCredential(): Cred | null;
}

declare interface IssueCredentialMessageOptions {
    id?: string;
    comment?: string;
    credentialAttachments: Attachment[];
    attachments?: Attachment[];
}

export declare class JsonTransformer {
    static toJSON<T>(classInstance: T): Record<string, any>;
    static fromJSON<T>(json: any, Class: {
        new (...args: any[]): T;
    }): T;
    static serialize<T>(classInstance: T): string;
    static deserialize<T>(jsonString: string, Class: {
        new (...args: any[]): T;
    }): T;
}

declare type Jws = JwsGeneralFormat | JwsFlattenedFormat;

declare interface JwsFlattenedFormat {
    signatures: JwsGeneralFormat[];
}

declare interface JwsGeneralFormat {
    header: Record<string, unknown>;
    signature: string;
    protected: string;
}

declare const enum KeyDerivationMethod {
    /** default value in indy-sdk. Will be used when no value is provided */
    Argon2IMod = "ARGON2I_MOD",
    /** less secure, but faster */
    Argon2IInt = "ARGON2I_INT",
    /** raw wallet master key */
    Raw = "RAW"
}

export declare class KeylistUpdate {
    constructor(options: {
        recipientKey: Verkey;
        action: KeylistUpdateAction;
    });
    recipientKey: Verkey;
    action: KeylistUpdateAction;
}

export declare enum KeylistUpdateAction {
    add = "add",
    remove = "remove"
}

export declare class KeylistUpdated {
    constructor(options: {
        recipientKey: Verkey;
        action: KeylistUpdateAction;
        result: KeylistUpdateResult;
    });
    recipientKey: Verkey;
    action: KeylistUpdateAction;
    result: KeylistUpdateResult;
}

export declare interface KeylistUpdatedEvent extends BaseEvent {
    type: typeof RoutingEventTypes.RecipientKeylistUpdated;
    payload: {
        mediationRecord: MediationRecord;
        keylist: KeylistUpdate[];
    };
}

/**
 * Used to notify the mediator of keys in use by the recipient.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0211-route-coordination/README.md#keylist-update
 */
export declare class KeylistUpdateMessage extends AgentMessage {
    constructor(options: KeylistUpdateMessageOptions);
    readonly type = "https://didcomm.org/coordinate-mediation/1.0/keylist-update";
    static readonly type = "https://didcomm.org/coordinate-mediation/1.0/keylist-update";
    updates: KeylistUpdate[];
}

export declare interface KeylistUpdateMessageOptions {
    id?: string;
    updates: KeylistUpdate[];
}

/**
 * Used to notify an edge agent with the result of updating the routing keys in the mediator.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0211-route-coordination/README.md#keylist-update-response
 */
export declare class KeylistUpdateResponseMessage extends AgentMessage {
    constructor(options: KeylistUpdateResponseMessageOptions);
    readonly type = "https://didcomm.org/coordinate-mediation/1.0/keylist-update-response";
    static readonly type = "https://didcomm.org/coordinate-mediation/1.0/keylist-update-response";
    updated: KeylistUpdated[];
}

export declare interface KeylistUpdateResponseMessageOptions {
    id?: string;
    keylist: KeylistUpdated[];
    threadId: string;
}

export declare enum KeylistUpdateResult {
    ClientError = "client_error",
    ServerError = "server_error",
    NoChange = "no_change",
    Success = "success"
}

/**
 * Represents `~l10n` decorator
 */
declare class L10nDecorator {
    constructor(partial?: Partial<L10nDecorator>);
    locale?: string;
}

export declare class LedgerModule {
    private ledgerService;
    private wallet;
    constructor(wallet: Wallet, ledgerService: IndyLedgerService);
    /**
     * Connect to all the ledger pools
     */
    connectToPools(): Promise<void>;
    registerPublicDid(did: string, verkey: string, alias: string, role?: NymRole): Promise<string>;
    getPublicDid(did: string): Promise<GetNymResponse>;
    registerSchema(schema: SchemaTemplate): Promise<Schema>;
    getSchema(id: string): Promise<Schema>;
    registerCredentialDefinition(credentialDefinitionTemplate: Omit<CredentialDefinitionTemplate, 'signatureType'>): Promise<CredDef>;
    getCredentialDefinition(id: string): Promise<CredDef>;
    getRevocationRegistryDefinition(revocationRegistryDefinitionId: string): Promise<ParseRevocationRegistryDefitinionTemplate>;
    getRevocationRegistryDelta(revocationRegistryDefinitionId: string, fromSeconds?: number, toSeconds?: number): Promise<ParseRevocationRegistryDeltaTemplate>;
}

declare class LinkedAttachment {
    constructor(options: LinkedAttachmentOptions);
    /**
     * The name that will be used to generate the linked credential
     */
    attributeName: string;
    /**
     * The attachment that needs to be linked to the credential
     */
    attachment: Attachment;
    /**
     * Generates an ID based on the data in the attachment
     *
     * @param attachment the attachment that requires a hashlink
     * @returns the id
     */
    private getId;
}

declare interface LinkedAttachmentOptions {
    name: string;
    attachment: Attachment;
}

export declare interface Logger {
    logLevel: LogLevel;
    test(message: string, data?: Record<string, any>): void;
    trace(message: string, data?: Record<string, any>): void;
    debug(message: string, data?: Record<string, any>): void;
    info(message: string, data?: Record<string, any>): void;
    warn(message: string, data?: Record<string, any>): void;
    error(message: string, data?: Record<string, any>): void;
    fatal(message: string, data?: Record<string, any>): void;
}

export declare enum LogLevel {
    test = 0,
    trace = 1,
    debug = 2,
    info = 3,
    warn = 4,
    error = 5,
    fatal = 6,
    off = 7
}

/**
 * This message serves as notification of the mediator denying the recipient's request for mediation.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0211-route-coordination/README.md#mediation-deny
 */
export declare class MediationDenyMessage extends AgentMessage {
    constructor(options: MediationDenyMessageOptions);
    readonly type = "https://didcomm.org/coordinate-mediation/1.0/mediate-deny";
    static readonly type = "https://didcomm.org/coordinate-mediation/1.0/mediate-deny";
}

export declare interface MediationDenyMessageOptions {
    id: string;
}

/**
 * A route grant message is a signal from the mediator to the recipient that permission is given to distribute the
 * included information as an inbound route.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0211-route-coordination/README.md#mediation-grant
 */
export declare class MediationGrantMessage extends AgentMessage {
    constructor(options: MediationGrantMessageOptions);
    readonly type = "https://didcomm.org/coordinate-mediation/1.0/mediate-grant";
    static readonly type = "https://didcomm.org/coordinate-mediation/1.0/mediate-grant";
    routingKeys: string[];
    endpoint: string;
}

export declare interface MediationGrantMessageOptions {
    id?: string;
    endpoint: string;
    routingKeys: string[];
    threadId: string;
}

export declare interface MediationProtocolMsgReturnType<MessageType extends AgentMessage> {
    message: MessageType;
    mediationRecord: MediationRecord;
}

export declare class MediationRecipientService {
    private wallet;
    private mediatorRepository;
    private eventEmitter;
    private connectionService;
    private messageSender;
    private config;
    private logger;
    private messageReceiver;
    constructor(wallet: Wallet, connectionService: ConnectionService, messageSender: MessageSender, config: AgentConfig, mediatorRepository: MediationRepository, eventEmitter: EventEmitter, messageReveiver: MessageReceiver);
    requestStatus(config?: {
        mediatorId?: string;
        recipientKey?: string;
    }): Promise<void>;
    createRequest(connection: ConnectionRecord): Promise<MediationProtocolMsgReturnType<MediationRequestMessage>>;
    processMediationGrant(messageContext: InboundMessageContext<MediationGrantMessage>): Promise<MediationRecord>;
    processKeylistUpdateResults(messageContext: InboundMessageContext<KeylistUpdateResponseMessage>): Promise<void>;
    keylistUpdateAndAwait(mediationRecord: MediationRecord, verKey: string, timeoutMs?: number): Promise<MediationRecord>;
    createKeylistUpdateMessage(verkey: string): KeylistUpdateMessage;
    getRouting({ mediatorId, useDefaultMediator }?: GetRoutingOptions): Promise<Routing>;
    processMediationDeny(messageContext: InboundMessageContext<MediationDenyMessage>): Promise<MediationRecord>;
    processStatus(statusMessage: StatusMessage): DeliveryRequestMessage | null;
    processDelivery(messageDeliveryMessage: MessageDeliveryMessage): Promise<MessagesReceivedMessage>;
    /**
     * Update the record to a new state and emit an state changed event. Also updates the record
     * in storage.
     *
     * @param MediationRecord The proof record to update the state for
     * @param newState The state to update to
     *
     */
    private updateState;
    getById(id: string): Promise<MediationRecord>;
    findByConnectionId(connectionId: string): Promise<MediationRecord | null>;
    getMediators(): Promise<MediationRecord[]>;
    findDefaultMediator(): Promise<MediationRecord | null>;
    discoverMediation(mediatorId?: string): Promise<MediationRecord | undefined>;
    setDefaultMediator(mediator: MediationRecord): Promise<void>;
    clearDefaultMediator(): Promise<void>;
}

export declare class MediationRecord extends BaseRecord<DefaultMediationTags, CustomMediationTags> implements MediationRecordProps {
    state: MediationState;
    role: MediationRole;
    connectionId: string;
    threadId: string;
    endpoint?: string;
    recipientKeys: string[];
    routingKeys: string[];
    pickupStrategy?: MediatorPickupStrategy;
    static readonly type = "MediationRecord";
    readonly type = "MediationRecord";
    constructor(props: MediationRecordProps);
    getTags(): {
        state: MediationState;
        role: MediationRole;
        connectionId: string;
        threadId: string;
        recipientKeys: string[];
        default?: boolean | undefined;
    };
    addRecipientKey(recipientKey: string): void;
    removeRecipientKey(recipientKey: string): boolean;
    get isReady(): boolean;
    assertReady(): void;
    assertState(expectedStates: MediationState | MediationState[]): void;
    assertRole(expectedRole: MediationRole): void;
}

export declare interface MediationRecordProps {
    id?: string;
    state: MediationState;
    role: MediationRole;
    createdAt?: Date;
    connectionId: string;
    threadId: string;
    endpoint?: string;
    recipientKeys?: string[];
    routingKeys?: string[];
    pickupStrategy?: MediatorPickupStrategy;
    tags?: CustomMediationTags;
}

export declare class MediationRepository extends Repository<MediationRecord> {
    constructor(storageService: StorageService<MediationRecord>);
    getSingleByRecipientKey(recipientKey: string): Promise<MediationRecord>;
    getByConnectionId(connectionId: string): Promise<MediationRecord>;
}

/**
 * This message serves as a request from the recipient to the mediator, asking for the permission (and routing information)
 * to publish the endpoint as a mediator.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0211-route-coordination/README.md#mediation-request
 */
export declare class MediationRequestMessage extends AgentMessage {
    /**
     * Create new BasicMessage instance.
     * sentTime will be assigned to new Date if not passed, id will be assigned to uuid/v4 if not passed
     * @param options
     */
    constructor(options: MediationRequestMessageOptions);
    readonly type = "https://didcomm.org/coordinate-mediation/1.0/mediate-request";
    static readonly type = "https://didcomm.org/coordinate-mediation/1.0/mediate-request";
}

export declare interface MediationRequestMessageOptions {
    sentTime?: Date;
    id?: string;
    locale?: string;
}

/**
 * Mediation roles based on the flow defined in RFC 0211.
 *
 * @see https://github.com/hyperledger/aries-rfcs/tree/master/features/0211-route-coordination/README.md
 */
export declare enum MediationRole {
    Mediator = "MEDIATOR",
    Recipient = "RECIPIENT"
}

/**
 * Mediation states based on the flow defined in RFC 0211.
 *
 * @see https://github.com/hyperledger/aries-rfcs/tree/master/features/0211-route-coordination/README.md
 */
export declare enum MediationState {
    Requested = "requested",
    Granted = "granted",
    Denied = "denied"
}

export declare interface MediationStateChangedEvent extends BaseEvent {
    type: typeof RoutingEventTypes.MediationStateChanged;
    payload: {
        mediationRecord: MediationRecord;
        previousState: MediationState | null;
    };
}

export declare class MediatorModule {
    private mediatorService;
    private messagePickupService;
    private messageSender;
    eventEmitter: EventEmitter;
    agentConfig: AgentConfig;
    connectionService: ConnectionService;
    constructor(dispatcher: Dispatcher, mediationService: MediatorService, messagePickupService: MessagePickupService, messageSender: MessageSender, messageReceiver: MessageReceiver, eventEmitter: EventEmitter, agentConfig: AgentConfig, connectionService: ConnectionService);
    grantRequestedMediation(mediatorId: string): Promise<MediationRecord>;
    queueMessage(connectionId: string, message: EncryptedMessage): void;
    private registerHandlers;
}

export declare enum MediatorPickupStrategy {
    PickUpV1 = "PickUpV1",
    PickUpV2 = "PickUpV2",
    Implicit = "Implicit",
    None = "None"
}

export declare class MediatorRoutingRecord extends BaseRecord implements MediatorRoutingRecordProps {
    routingKeys: string[];
    static readonly type = "MediatorRoutingRecord";
    readonly type = "MediatorRoutingRecord";
    constructor(props: MediatorRoutingRecordProps);
    getTags(): TagsBase;
}

export declare interface MediatorRoutingRecordProps {
    id?: string;
    createdAt?: Date;
    routingKeys?: string[];
    tags?: TagsBase;
}

export declare class MediatorRoutingRepository extends Repository<MediatorRoutingRecord> {
    readonly MEDIATOR_ROUTING_RECORD_ID = "MEDIATOR_ROUTING_RECORD";
    constructor(storageService: StorageService<MediatorRoutingRecord>);
}

export declare class MediatorService {
    private agentConfig;
    private mediationRepository;
    private mediatorRoutingRepository;
    private wallet;
    private eventEmitter;
    private _mediatorRoutingRecord?;
    constructor(mediationRepository: MediationRepository, mediatorRoutingRepository: MediatorRoutingRepository, agentConfig: AgentConfig, wallet: Wallet, eventEmitter: EventEmitter);
    private getRoutingKeys;
    processForwardMessage(messageContext: InboundMessageContext<ForwardMessage>): Promise<{
        mediationRecord: MediationRecord;
        encryptedMessage: EncryptedMessage;
    }>;
    processKeylistUpdateRequest(messageContext: InboundMessageContext<KeylistUpdateMessage>): Promise<KeylistUpdateResponseMessage>;
    createGrantMediationMessage(mediationRecord: MediationRecord): Promise<{
        mediationRecord: MediationRecord;
        message: MediationGrantMessage;
    }>;
    processMediationRequest(messageContext: InboundMessageContext<MediationRequestMessage>): Promise<MediationRecord>;
    findById(mediatorRecordId: string): Promise<MediationRecord | null>;
    getById(mediatorRecordId: string): Promise<MediationRecord>;
    getAll(): Promise<MediationRecord[]>;
    private updateState;
}

declare interface MessageContextParams {
    connection?: ConnectionRecord;
    senderVerkey?: string;
    recipientVerkey?: string;
    sessionId?: string;
}

export declare class MessageDeliveryMessage extends AgentMessage {
    constructor(options: MessageDeliveryMessageOptions);
    readonly type = "https://didcomm.org/messagepickup/2.0/delivery";
    static readonly type = "https://didcomm.org/messagepickup/2.0/delivery";
    recipientKey?: string;
}

export declare interface MessageDeliveryMessageOptions {
    id?: string;
    recipientKey?: string;
    attachments: Attachment[];
}

export declare class MessagePickupService {
    private messageRepository;
    constructor(messageRepository: MessageRepository);
    batch(messageContext: InboundMessageContext<BatchPickupMessage>): Promise<OutboundMessage<BatchMessage>>;
    queueMessage(connectionId: string, message: EncryptedMessage): void;
}

declare class MessageReceiver {
    private config;
    private envelopeService;
    private transportService;
    private messageSender;
    private dispatcher;
    private logger;
    private didRepository;
    private connectionRepository;
    readonly inboundTransports: InboundTransport[];
    constructor(config: AgentConfig, envelopeService: EnvelopeService, transportService: TransportService, messageSender: MessageSender, connectionRepository: ConnectionRepository, dispatcher: Dispatcher, didRepository: DidRepository);
    registerInboundTransport(inboundTransport: InboundTransport): void;
    /**
     * Receive and handle an inbound DIDComm message. It will decrypt the message, transform it
     * to it's corresponding message class and finally dispatch it to the dispatcher.
     *
     * @param inboundMessage the message to receive and handle
     */
    receiveMessage(inboundMessage: unknown, session?: TransportSession): Promise<void>;
    private receivePlaintextMessage;
    private receiveEncryptedMessage;
    /**
     * Decrypt a message using the envelope service.
     *
     * @param message the received inbound message to decrypt
     */
    private decryptMessage;
    private isPlaintextMessage;
    private isEncryptedMessage;
    private transformAndValidate;
    private findConnectionByMessageKeys;
    /**
     * Transform an plaintext DIDComm message into it's corresponding message class. Will look at all message types in the registered handlers.
     *
     * @param message the plaintext message for which to transform the message in to a class instance
     */
    private transformMessage;
    /**
     * Validate an AgentMessage instance.
     * @param message agent message to validate
     */
    private validateMessage;
    /**
     * Send the problem report message (https://didcomm.org/notification/1.0/problem-report) to the recipient.
     * @param message error message to send
     * @param connection connection to send the message to
     * @param plaintextMessage received inbound message
     */
    private sendProblemReportMessage;
}

declare interface MessageRepository {
    takeFromQueue(connectionId: string, limit?: number): EncryptedMessage[];
    add(connectionId: string, payload: EncryptedMessage): void;
}

export declare class MessageSender {
    private envelopeService;
    private transportService;
    private messageRepository;
    private logger;
    private didResolverService;
    readonly outboundTransports: OutboundTransport[];
    constructor(envelopeService: EnvelopeService, transportService: TransportService, messageRepository: MessageRepository, logger: Logger, didResolverService: DidResolverService);
    registerOutboundTransport(outboundTransport: OutboundTransport): void;
    packMessage({ keys, message, endpoint, }: {
        keys: EnvelopeKeys;
        message: AgentMessage;
        endpoint: string;
    }): Promise<OutboundPackage>;
    private sendMessageToSession;
    sendPackage({ connection, encryptedMessage, options, }: {
        connection: ConnectionRecord;
        encryptedMessage: EncryptedMessage;
        options?: {
            transportPriority?: TransportPriorityOptions;
        };
    }): Promise<void>;
    sendMessage(outboundMessage: OutboundMessage, options?: {
        transportPriority?: TransportPriorityOptions;
    }): Promise<void>;
    sendMessageToService({ message, service, senderKey, returnRoute, connectionId, }: {
        message: AgentMessage;
        service: DidCommService;
        senderKey: string;
        returnRoute?: boolean;
        connectionId?: string;
    }): Promise<void>;
    private retrieveServicesByConnection;
}

export declare class MessagesReceivedMessage extends AgentMessage {
    constructor(options: MessagesReceivedMessageOptions);
    readonly type = "https://didcomm.org/messagepickup/2.0/messages-received";
    static readonly type = "https://didcomm.org/messagepickup/2.0/messages-received";
    messageIdList?: string[];
}

export declare interface MessagesReceivedMessageOptions {
    id?: string;
    messageIdList: string[];
}

/**
 * Metadata access class to get, set (create and update), add (append to a record) and delete metadata on any record.
 *
 * set will override the previous value if it already exists
 *
 * note: To add persistence to these records, you have to update the record in the correct repository
 *
 * @example
 *
 * ```ts
 * connectionRecord.metadata.set('foo', { bar: 'baz' }) connectionRepository.update(connectionRecord)
 * ```
 */
declare class Metadata<MetadataTypes> {
    readonly data: MetadataBase;
    constructor(data: MetadataBase);
    /**
     * Gets the value by key in the metadata
     *
     * Any extension of the `BaseRecord` can implement their own typed metadata
     *
     * @param key the key to retrieve the metadata by
     * @returns the value saved in the key value pair
     * @returns null when the key could not be found
     */
    get<Value extends Record<string, unknown>, Key extends string = string>(key: Key): (Key extends keyof MetadataTypes ? MetadataTypes[Key] : Value) | null;
    /**
     * Will set, or override, a key-value pair on the metadata
     *
     * @param key the key to set the metadata by
     * @param value the value to set in the metadata
     */
    set<Value extends Record<string, unknown>, Key extends string = string>(key: Key, value: Key extends keyof MetadataTypes ? MetadataTypes[Key] : Value): void;
    /**
     * Adds a record to a metadata key
     *
     * @param key the key to add the metadata at
     * @param value the value to add in the metadata
     */
    add<Value extends Record<string, unknown>, Key extends string = string>(key: Key, value: Partial<Key extends keyof MetadataTypes ? MetadataTypes[Key] : Value>): void;
    /**
     * Retrieves all the metadata for a record
     *
     * @returns all the metadata that exists on the record
     */
    get keys(): string[];
    /**
     * Will delete the key value pair in the metadata
     *
     * @param key the key to delete the data by
     */
    delete<Key extends string = string>(key: Key): void;
}

declare type MetadataBase = {
    [key: string]: Record<string, unknown>;
};

/**
 * Message part of Issue Credential Protocol used to continue or initiate credential exchange by issuer.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#offer-credential
 */
export declare class OfferCredentialMessage extends AgentMessage {
    constructor(options: OfferCredentialMessageOptions);
    readonly type = "https://didcomm.org/issue-credential/1.0/offer-credential";
    static readonly type = "https://didcomm.org/issue-credential/1.0/offer-credential";
    comment?: string;
    credentialPreview: CredentialPreview;
    offerAttachments: Attachment[];
    get indyCredentialOffer(): CredOffer | null;
}

export declare interface OfferCredentialMessageOptions {
    id?: string;
    comment?: string;
    offerAttachments: Attachment[];
    credentialPreview: CredentialPreview;
    attachments?: Attachment[];
}

declare interface OutboundMessage<T extends AgentMessage = AgentMessage> {
    payload: T;
    connection: ConnectionRecord;
    sessionId?: string;
}

export declare interface OutboundPackage {
    payload: EncryptedMessage;
    responseRequested?: boolean;
    endpoint?: string;
    connectionId?: string;
}

declare interface OutboundServiceMessage<T extends AgentMessage = AgentMessage> {
    payload: T;
    service: DidCommService;
    senderKey: string;
}

export declare interface OutboundTransport {
    supportedSchemes: string[];
    sendMessage(outboundPackage: OutboundPackage): Promise<void>;
    start(agent: Agent): Promise<void>;
    stop(): Promise<void>;
}

export declare interface OutboundWebSocketClosedEvent extends BaseEvent {
    type: TransportEventTypes.OutboundWebSocketClosedEvent;
    payload: {
        socketId: string;
        connectionId?: string;
    };
}

export declare interface ParseRevocationRegistryDefitinionTemplate {
    revocationRegistryDefinition: default_2.RevocRegDef;
    revocationRegistryDefinitionTxnTime: number;
}

export declare interface ParseRevocationRegistryDeltaTemplate {
    revocationRegistryDelta: default_2.RevocRegDelta;
    deltaTimestamp: number;
}

export declare interface ParseRevocationRegistryTemplate {
    revocationRegistry: default_2.RevocReg;
    ledgerTimestamp: number;
}

export declare class PartialProof {
    constructor(options: PartialProof);
    identifiers: ProofIdentifier[];
    requestedProof: RequestedProof;
}

declare interface PlaintextMessage {
    '@type': string;
    '@id': string;
    [key: string]: unknown;
}

export declare enum PredicateType {
    LessThan = "<",
    LessThanOrEqualTo = "<=",
    GreaterThan = ">",
    GreaterThanOrEqualTo = ">="
}

/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0015-acks/README.md#explicit-acks
 */
export declare class PresentationAckMessage extends AckMessage {
    constructor(options: PresentationAckMessageOptions);
    readonly type = "https://didcomm.org/present-proof/1.0/ack";
    static readonly type = "https://didcomm.org/present-proof/1.0/ack";
}

export declare type PresentationAckMessageOptions = AckMessageOptions;

/**
 * Presentation Message part of Present Proof Protocol used as a response to a {@link PresentationRequestMessage | Presentation Request Message} from prover to verifier.
 * Contains signed presentations.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#presentation
 */
export declare class PresentationMessage extends AgentMessage {
    constructor(options: PresentationOptions);
    readonly type = "https://didcomm.org/present-proof/1.0/presentation";
    static readonly type = "https://didcomm.org/present-proof/1.0/presentation";
    /**
     *  Provides some human readable information about this request for a presentation.
     */
    comment?: string;
    /**
     * An array of attachments containing the presentation in the requested format(s).
     */
    presentationAttachments: Attachment[];
    get indyProof(): IndyProof | null;
}

export declare interface PresentationOptions {
    id?: string;
    comment?: string;
    presentationAttachments: Attachment[];
    attachments?: Attachment[];
}

/**
 * Presentation preview inner message class.
 *
 * This is not a message but an inner object for other messages in this protocol. It is used to construct a preview of the data for the presentation.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#presentation-preview
 */
export declare class PresentationPreview {
    constructor(options: PresentationPreviewOptions);
    readonly type = "https://didcomm.org/present-proof/1.0/presentation-preview";
    static readonly type = "https://didcomm.org/present-proof/1.0/presentation-preview";
    attributes: PresentationPreviewAttribute[];
    predicates: PresentationPreviewPredicate[];
    toJSON(): Record<string, unknown>;
}

export declare class PresentationPreviewAttribute {
    constructor(options: PresentationPreviewAttributeOptions);
    name: string;
    credentialDefinitionId?: string;
    mimeType?: string;
    value?: string;
    referent?: string;
    toJSON(): Record<string, unknown>;
}

export declare interface PresentationPreviewAttributeOptions {
    name: string;
    credentialDefinitionId?: string;
    mimeType?: string;
    value?: string;
    referent?: string;
}

export declare interface PresentationPreviewOptions {
    attributes?: PresentationPreviewAttribute[];
    predicates?: PresentationPreviewPredicate[];
}

export declare class PresentationPreviewPredicate {
    constructor(options: PresentationPreviewPredicateOptions);
    name: string;
    credentialDefinitionId: string;
    predicate: PredicateType;
    threshold: number;
    toJSON(): Record<string, unknown>;
}

export declare interface PresentationPreviewPredicateOptions {
    name: string;
    credentialDefinitionId: string;
    predicate: PredicateType;
    threshold: number;
}

/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0035-report-problem/README.md
 */
export declare class PresentationProblemReportMessage extends ProblemReportMessage {
    /**
     * Create new PresentationProblemReportMessage instance.
     * @param options
     */
    constructor(options: PresentationProblemReportMessageOptions);
    readonly type = "https://didcomm.org/present-proof/1.0/problem-report";
    static readonly type = "https://didcomm.org/present-proof/1.0/problem-report";
}

export declare type PresentationProblemReportMessageOptions = ProblemReportMessageOptions;

/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0035-report-problem/README.md
 */
declare class ProblemReportMessage extends AgentMessage {
    /**
     * Create new ReportProblem instance.
     * @param options
     */
    constructor(options: ProblemReportMessageOptions);
    readonly type: string;
    static readonly type: string;
    description: DescriptionOptions;
    problemItems?: string[];
    whoRetries?: WhoRetriesStatus;
    fixHint?: FixHintOptions;
    where?: WhereStatus;
    impact?: ImpactStatus;
    noticedTime?: string;
    trackingUri?: string;
    escalationUri?: string;
}

declare interface ProblemReportMessageOptions {
    id?: string;
    description: DescriptionOptions;
    problemItems?: string[];
    whoRetries?: WhoRetriesStatus;
    fixHint?: FixHintOptions;
    impact?: ImpactStatus;
    where?: WhereStatus;
    noticedTime?: string;
    trackingUri?: string;
    escalationUri?: string;
}

export declare class ProofAttribute {
    constructor(options: ProofAttribute);
    subProofIndex: number;
    raw: string;
    encoded: string;
}

export declare class ProofAttributeInfo {
    constructor(options: ProofAttributeInfo);
    name?: string;
    names?: string[];
    nonRevoked?: RevocationInterval;
    restrictions?: AttributeFilter[];
}

export declare enum ProofEventTypes {
    ProofStateChanged = "ProofStateChanged"
}

export declare class ProofIdentifier {
    constructor(options: ProofIdentifier);
    schemaId: string;
    credentialDefinitionId: string;
    revocationRegistryId?: string;
    timestamp?: number;
}

export declare class ProofPredicateInfo {
    constructor(options: ProofPredicateInfo);
    name: string;
    predicateType: PredicateType;
    predicateValue: number;
    nonRevoked?: RevocationInterval;
    restrictions?: AttributeFilter[];
}

export declare interface ProofProtocolMsgReturnType<MessageType extends AgentMessage> {
    message: MessageType;
    proofRecord: ProofRecord;
}

export declare class ProofRecord extends BaseRecord<DefaultProofTags, CustomProofTags> {
    connectionId?: string;
    threadId: string;
    isVerified?: boolean;
    presentationId?: string;
    state: ProofState;
    autoAcceptProof?: AutoAcceptProof;
    errorMessage?: string;
    proposalMessage?: ProposePresentationMessage;
    requestMessage?: RequestPresentationMessage;
    presentationMessage?: PresentationMessage;
    static readonly type = "ProofRecord";
    readonly type = "ProofRecord";
    constructor(props: ProofRecordProps);
    getTags(): {
        threadId: string;
        connectionId: string | undefined;
        state: ProofState;
    };
    assertState(expectedStates: ProofState | ProofState[]): void;
    assertConnection(currentConnectionId: string): void;
}

export declare interface ProofRecordProps {
    id?: string;
    createdAt?: Date;
    isVerified?: boolean;
    state: ProofState;
    connectionId?: string;
    threadId: string;
    presentationId?: string;
    tags?: CustomProofTags;
    autoAcceptProof?: AutoAcceptProof;
    errorMessage?: string;
    proposalMessage?: ProposePresentationMessage;
    requestMessage?: RequestPresentationMessage;
    presentationMessage?: PresentationMessage;
}

export declare class ProofRepository extends Repository<ProofRecord> {
    constructor(storageService: StorageService<ProofRecord>);
}

/**
 * Proof Request for Indy based proof format
 *
 * @see https://github.com/hyperledger/indy-sdk/blob/57dcdae74164d1c7aa06f2cccecaae121cefac25/libindy/src/api/anoncreds.rs#L1222-L1239
 */
export declare class ProofRequest {
    constructor(options: ProofRequestOptions);
    name: string;
    version: string;
    nonce: string;
    requestedAttributes: Map<string, ProofAttributeInfo>;
    requestedPredicates: Map<string, ProofPredicateInfo>;
    nonRevoked?: RevocationInterval;
    ver?: '1.0' | '2.0';
    toJSON(): IndyProofRequest;
}

export declare interface ProofRequestConfig {
    comment?: string;
    autoAcceptProof?: AutoAcceptProof;
}

export declare interface ProofRequestOptions {
    name: string;
    version: string;
    nonce: string;
    nonRevoked?: RevocationInterval;
    ver?: '1.0' | '2.0';
    requestedAttributes?: Record<string, ProofAttributeInfo> | Map<string, ProofAttributeInfo>;
    requestedPredicates?: Record<string, ProofPredicateInfo> | Map<string, ProofPredicateInfo>;
}

export declare interface ProofRequestTemplate {
    proofRequest: ProofRequest;
    comment?: string;
}

/**
 * This class handles all the automation with all the messages in the present proof protocol
 * Every function returns `true` if it should automate the flow and `false` if not
 */
declare class ProofResponseCoordinator {
    private agentConfig;
    constructor(agentConfig: AgentConfig);
    /**
     * Returns the proof auto accept config based on priority:
     *	- The record config takes first priority
     *	- Otherwise the agent config
     *	- Otherwise {@link AutoAcceptProof.Never} is returned
     */
    private static composeAutoAccept;
    /**
     * Checks whether it should automatically respond to a proposal
     */
    shouldAutoRespondToProposal(proofRecord: ProofRecord): boolean;
    /**
     * Checks whether it should automatically respond to a request
     */
    shouldAutoRespondToRequest(proofRecord: ProofRecord): boolean;
    /**
     * Checks whether it should automatically respond to a presentation of proof
     */
    shouldAutoRespondToPresentation(proofRecord: ProofRecord): boolean;
}

/**
 * @todo add method to check if request matches proposal. Useful to see if a request I received is the same as the proposal I sent.
 * @todo add method to reject / revoke messages
 * @todo validate attachments / messages
 */
export declare class ProofService {
    private proofRepository;
    private credentialRepository;
    private ledgerService;
    private wallet;
    private logger;
    private indyHolderService;
    private indyVerifierService;
    private indyRevocationService;
    private connectionService;
    private eventEmitter;
    constructor(proofRepository: ProofRepository, ledgerService: IndyLedgerService, wallet: Wallet, agentConfig: AgentConfig, indyHolderService: IndyHolderService, indyVerifierService: IndyVerifierService, indyRevocationService: IndyRevocationService, connectionService: ConnectionService, eventEmitter: EventEmitter, credentialRepository: CredentialRepository);
    /**
     * Create a {@link ProposePresentationMessage} not bound to an existing presentation exchange.
     * To create a proposal as response to an existing presentation exchange, use {@link ProofService.createProposalAsResponse}.
     *
     * @param connectionRecord The connection for which to create the presentation proposal
     * @param presentationProposal The presentation proposal to include in the message
     * @param config Additional configuration to use for the proposal
     * @returns Object containing proposal message and associated proof record
     *
     */
    createProposal(connectionRecord: ConnectionRecord, presentationProposal: PresentationPreview, config?: {
        comment?: string;
        autoAcceptProof?: AutoAcceptProof;
    }): Promise<ProofProtocolMsgReturnType<ProposePresentationMessage>>;
    /**
     * Create a {@link ProposePresentationMessage} as response to a received presentation request.
     * To create a proposal not bound to an existing presentation exchange, use {@link ProofService.createProposal}.
     *
     * @param proofRecord The proof record for which to create the presentation proposal
     * @param presentationProposal The presentation proposal to include in the message
     * @param config Additional configuration to use for the proposal
     * @returns Object containing proposal message and associated proof record
     *
     */
    createProposalAsResponse(proofRecord: ProofRecord, presentationProposal: PresentationPreview, config?: {
        comment?: string;
    }): Promise<ProofProtocolMsgReturnType<ProposePresentationMessage>>;
    /**
     * Decline a proof request
     * @param proofRecord The proof request to be declined
     */
    declineRequest(proofRecord: ProofRecord): Promise<ProofRecord>;
    /**
     * Process a received {@link ProposePresentationMessage}. This will not accept the presentation proposal
     * or send a presentation request. It will only create a new, or update the existing proof record with
     * the information from the presentation proposal message. Use {@link ProofService.createRequestAsResponse}
     * after calling this method to create a presentation request.
     *
     * @param messageContext The message context containing a presentation proposal message
     * @returns proof record associated with the presentation proposal message
     *
     */
    processProposal(messageContext: InboundMessageContext<ProposePresentationMessage>): Promise<ProofRecord>;
    /**
     * Create a {@link RequestPresentationMessage} as response to a received presentation proposal.
     * To create a request not bound to an existing presentation exchange, use {@link ProofService.createRequest}.
     *
     * @param proofRecord The proof record for which to create the presentation request
     * @param proofRequest The proof request to include in the message
     * @param config Additional configuration to use for the request
     * @returns Object containing request message and associated proof record
     *
     */
    createRequestAsResponse(proofRecord: ProofRecord, proofRequest: ProofRequest, config?: {
        comment?: string;
    }): Promise<ProofProtocolMsgReturnType<RequestPresentationMessage>>;
    /**
     * Create a {@link RequestPresentationMessage} not bound to an existing presentation exchange.
     * To create a request as response to an existing presentation exchange, use {@link ProofService#createRequestAsResponse}.
     *
     * @param proofRequestTemplate The proof request template
     * @param connectionRecord The connection for which to create the presentation request
     * @returns Object containing request message and associated proof record
     *
     */
    createRequest(proofRequest: ProofRequest, connectionRecord?: ConnectionRecord, config?: {
        comment?: string;
        autoAcceptProof?: AutoAcceptProof;
    }): Promise<ProofProtocolMsgReturnType<RequestPresentationMessage>>;
    /**
     * Process a received {@link RequestPresentationMessage}. This will not accept the presentation request
     * or send a presentation. It will only create a new, or update the existing proof record with
     * the information from the presentation request message. Use {@link ProofService.createPresentation}
     * after calling this method to create a presentation.
     *
     * @param messageContext The message context containing a presentation request message
     * @returns proof record associated with the presentation request message
     *
     */
    processRequest(messageContext: InboundMessageContext<RequestPresentationMessage>): Promise<ProofRecord>;
    /**
     * Create a {@link PresentationMessage} as response to a received presentation request.
     *
     * @param proofRecord The proof record for which to create the presentation
     * @param requestedCredentials The requested credentials object specifying which credentials to use for the proof
     * @param config Additional configuration to use for the presentation
     * @returns Object containing presentation message and associated proof record
     *
     */
    createPresentation(proofRecord: ProofRecord, requestedCredentials: RequestedCredentials, config?: {
        comment?: string;
    }): Promise<ProofProtocolMsgReturnType<PresentationMessage>>;
    /**
     * Process a received {@link PresentationMessage}. This will not accept the presentation
     * or send a presentation acknowledgement. It will only update the existing proof record with
     * the information from the presentation message. Use {@link ProofService.createAck}
     * after calling this method to create a presentation acknowledgement.
     *
     * @param messageContext The message context containing a presentation message
     * @returns proof record associated with the presentation message
     *
     */
    processPresentation(messageContext: InboundMessageContext<PresentationMessage>): Promise<ProofRecord>;
    /**
     * Create a {@link PresentationAckMessage} as response to a received presentation.
     *
     * @param proofRecord The proof record for which to create the presentation acknowledgement
     * @returns Object containing presentation acknowledgement message and associated proof record
     *
     */
    createAck(proofRecord: ProofRecord): Promise<ProofProtocolMsgReturnType<PresentationAckMessage>>;
    /**
     * Process a received {@link PresentationAckMessage}.
     *
     * @param messageContext The message context containing a presentation acknowledgement message
     * @returns proof record associated with the presentation acknowledgement message
     *
     */
    processAck(messageContext: InboundMessageContext<PresentationAckMessage>): Promise<ProofRecord>;
    /**
     * Process a received {@link PresentationProblemReportMessage}.
     *
     * @param messageContext The message context containing a presentation problem report message
     * @returns proof record associated with the presentation acknowledgement message
     *
     */
    processProblemReport(messageContext: InboundMessageContext<PresentationProblemReportMessage>): Promise<ProofRecord>;
    generateProofRequestNonce(): Promise<string>;
    /**
     * Create a {@link ProofRequest} from a presentation proposal. This method can be used to create the
     * proof request from a received proposal for use in {@link ProofService.createRequestAsResponse}
     *
     * @param presentationProposal The presentation proposal to create a proof request from
     * @param config Additional configuration to use for the proof request
     * @returns proof request object
     *
     */
    createProofRequestFromProposal(presentationProposal: PresentationPreview, config: {
        name: string;
        version: string;
        nonce?: string;
    }): Promise<ProofRequest>;
    /**
     * Retrieves the linked attachments for an {@link indyProofRequest}
     * @param indyProofRequest The proof request for which the linked attachments have to be found
     * @param requestedCredentials The requested credentials
     * @returns a list of attachments that are linked to the requested credentials
     */
    getRequestedAttachmentsForRequestedCredentials(indyProofRequest: ProofRequest, requestedCredentials: RequestedCredentials): Promise<Attachment[] | undefined>;
    /**
     * Create a {@link RetrievedCredentials} object. Given input proof request and presentation proposal,
     * use credentials in the wallet to build indy requested credentials object for input to proof creation.
     * If restrictions allow, self attested attributes will be used.
     *
     *
     * @param proofRequest The proof request to build the requested credentials object from
     * @param presentationProposal Optional presentation proposal to improve credential selection algorithm
     * @returns RetrievedCredentials object
     */
    getRequestedCredentialsForProofRequest(proofRequest: ProofRequest, config?: {
        presentationProposal?: PresentationPreview;
        filterByNonRevocationRequirements?: boolean;
    }): Promise<RetrievedCredentials>;
    /**
     * Takes a RetrievedCredentials object and auto selects credentials in a RequestedCredentials object
     *
     * Use the return value of this method as input to {@link ProofService.createPresentation} to
     * automatically accept a received presentation request.
     *
     * @param retrievedCredentials The retrieved credentials object to get credentials from
     *
     * @returns RequestedCredentials
     */
    autoSelectCredentialsForProofRequest(retrievedCredentials: RetrievedCredentials): RequestedCredentials;
    /**
     * Verify an indy proof object. Will also verify raw values against encodings.
     *
     * @param proofRequest The proof request to use for proof verification
     * @param proofJson The proof object to verify
     * @throws {Error} If the raw values do not match the encoded values
     * @returns Boolean whether the proof is valid
     *
     */
    verifyProof(proofJson: IndyProof, proofRequest: ProofRequest): Promise<boolean>;
    /**
     * Retrieve all proof records
     *
     * @returns List containing all proof records
     */
    getAll(): Promise<ProofRecord[]>;
    /**
     * Retrieve a proof record by id
     *
     * @param proofRecordId The proof record id
     * @throws {RecordNotFoundError} If no record is found
     * @return The proof record
     *
     */
    getById(proofRecordId: string): Promise<ProofRecord>;
    /**
     * Retrieve a proof record by id
     *
     * @param proofRecordId The proof record id
     * @return The proof record or null if not found
     *
     */
    findById(proofRecordId: string): Promise<ProofRecord | null>;
    /**
     * Delete a proof record by id
     *
     * @param proofId the proof record id
     */
    deleteById(proofId: string): Promise<void>;
    /**
     * Retrieve a proof record by connection id and thread id
     *
     * @param connectionId The connection id
     * @param threadId The thread id
     * @throws {RecordNotFoundError} If no record is found
     * @throws {RecordDuplicateError} If multiple records are found
     * @returns The proof record
     */
    getByThreadAndConnectionId(threadId: string, connectionId?: string): Promise<ProofRecord>;
    update(proofRecord: ProofRecord): Promise<void>;
    /**
     * Create indy proof from a given proof request and requested credential object.
     *
     * @param proofRequest The proof request to create the proof for
     * @param requestedCredentials The requested credentials object specifying which credentials to use for the proof
     * @returns indy proof object
     */
    private createProof;
    private getCredentialsForProofRequest;
    private getRevocationStatusForRequestedItem;
    /**
     * Update the record to a new state and emit an state changed event. Also updates the record
     * in storage.
     *
     * @param proofRecord The proof record to update the state for
     * @param newState The state to update to
     *
     */
    private updateState;
    /**
     * Build schemas object needed to create and verify proof objects.
     *
     * Creates object with `{ schemaId: Schema }` mapping
     *
     * @param schemaIds List of schema ids
     * @returns Object containing schemas for specified schema ids
     *
     */
    private getSchemas;
    /**
     * Build credential definitions object needed to create and verify proof objects.
     *
     * Creates object with `{ credentialDefinitionId: CredentialDefinition }` mapping
     *
     * @param credentialDefinitionIds List of credential definition ids
     * @returns Object containing credential definitions for specified credential definition ids
     *
     */
    private getCredentialDefinitions;
}

export declare class ProofsModule {
    private proofService;
    private connectionService;
    private messageSender;
    private mediationRecipientService;
    private agentConfig;
    private proofResponseCoordinator;
    constructor(dispatcher: Dispatcher, proofService: ProofService, connectionService: ConnectionService, mediationRecipientService: MediationRecipientService, agentConfig: AgentConfig, messageSender: MessageSender, proofResponseCoordinator: ProofResponseCoordinator);
    /**
     * Initiate a new presentation exchange as prover by sending a presentation proposal message
     * to the connection with the specified connection id.
     *
     * @param connectionId The connection to send the proof proposal to
     * @param presentationProposal The presentation proposal to include in the message
     * @param config Additional configuration to use for the proposal
     * @returns Proof record associated with the sent proposal message
     *
     */
    proposeProof(connectionId: string, presentationProposal: PresentationPreview, config?: {
        comment?: string;
        autoAcceptProof?: AutoAcceptProof;
    }): Promise<ProofRecord>;
    /**
     * Accept a presentation proposal as verifier (by sending a presentation request message) to the connection
     * associated with the proof record.
     *
     * @param proofRecordId The id of the proof record for which to accept the proposal
     * @param config Additional configuration to use for the request
     * @returns Proof record associated with the presentation request
     *
     */
    acceptProposal(proofRecordId: string, config?: {
        request?: {
            name?: string;
            version?: string;
            nonce?: string;
        };
        comment?: string;
    }): Promise<ProofRecord>;
    /**
     * Initiate a new presentation exchange as verifier by sending a presentation request message
     * to the connection with the specified connection id
     *
     * @param connectionId The connection to send the proof request to
     * @param proofRequestOptions Options to build the proof request
     * @returns Proof record associated with the sent request message
     *
     */
    requestProof(connectionId: string, proofRequestOptions: CreateProofRequestOptions, config?: ProofRequestConfig): Promise<ProofRecord>;
    /**
     * Initiate a new presentation exchange as verifier by creating a presentation request
     * not bound to any connection. The request must be delivered out-of-band to the holder
     *
     * @param proofRequestOptions Options to build the proof request
     * @returns The proof record and proof request message
     *
     */
    createOutOfBandRequest(proofRequestOptions: CreateProofRequestOptions, config?: ProofRequestConfig): Promise<{
        requestMessage: RequestPresentationMessage;
        proofRecord: ProofRecord;
    }>;
    /**
     * Accept a presentation request as prover (by sending a presentation message) to the connection
     * associated with the proof record.
     *
     * @param proofRecordId The id of the proof record for which to accept the request
     * @param requestedCredentials The requested credentials object specifying which credentials to use for the proof
     * @param config Additional configuration to use for the presentation
     * @returns Proof record associated with the sent presentation message
     *
     */
    acceptRequest(proofRecordId: string, requestedCredentials: RequestedCredentials, config?: {
        comment?: string;
    }): Promise<ProofRecord>;
    /**
     * Declines a proof request as holder
     * @param proofRecordId the id of the proof request to be declined
     * @returns proof record that was declined
     */
    declineRequest(proofRecordId: string): Promise<ProofRecord>;
    /**
     * Accept a presentation as prover (by sending a presentation acknowledgement message) to the connection
     * associated with the proof record.
     *
     * @param proofRecordId The id of the proof record for which to accept the presentation
     * @returns Proof record associated with the sent presentation acknowledgement message
     *
     */
    acceptPresentation(proofRecordId: string): Promise<ProofRecord>;
    /**
     * Create a {@link RetrievedCredentials} object. Given input proof request and presentation proposal,
     * use credentials in the wallet to build indy requested credentials object for input to proof creation.
     * If restrictions allow, self attested attributes will be used.
     *
     *
     * @param proofRecordId the id of the proof request to get the matching credentials for
     * @param config optional configuration for credential selection process. Use `filterByPresentationPreview` (default `true`) to only include
     *  credentials that match the presentation preview from the presentation proposal (if available).

     * @returns RetrievedCredentials object
     */
    getRequestedCredentialsForProofRequest(proofRecordId: string, config?: GetRequestedCredentialsConfig): Promise<RetrievedCredentials>;
    /**
     * Takes a RetrievedCredentials object and auto selects credentials in a RequestedCredentials object
     *
     * Use the return value of this method as input to {@link ProofService.createPresentation} to
     * automatically accept a received presentation request.
     *
     * @param retrievedCredentials The retrieved credentials object to get credentials from
     *
     * @returns RequestedCredentials
     */
    autoSelectCredentialsForProofRequest(retrievedCredentials: RetrievedCredentials): RequestedCredentials;
    /**
     * Send problem report message for a proof record
     * @param proofRecordId  The id of the proof record for which to send problem report
     * @param message message to send
     * @returns proof record associated with the proof problem report message
     */
    sendProblemReport(proofRecordId: string, message: string): Promise<ProofRecord>;
    /**
     * Retrieve all proof records
     *
     * @returns List containing all proof records
     */
    getAll(): Promise<ProofRecord[]>;
    /**
     * Retrieve a proof record by id
     *
     * @param proofRecordId The proof record id
     * @throws {RecordNotFoundError} If no record is found
     * @throws {RecordDuplicateError} If multiple records are found
     * @return The proof record
     *
     */
    getById(proofRecordId: string): Promise<ProofRecord>;
    /**
     * Retrieve a proof record by id
     *
     * @param proofRecordId The proof record id
     * @return The proof record or null if not found
     *
     */
    findById(proofRecordId: string): Promise<ProofRecord | null>;
    /**
     * Delete a proof record by id
     *
     * @param proofId the proof record id
     */
    deleteById(proofId: string): Promise<void>;
    private registerHandlers;
}

/**
 * Present Proof protocol states as defined in RFC 0037
 *
 * @see https://github.com/hyperledger/aries-rfcs/tree/master/features/0037-present-proof#states
 */
export declare enum ProofState {
    ProposalSent = "proposal-sent",
    ProposalReceived = "proposal-received",
    RequestSent = "request-sent",
    RequestReceived = "request-received",
    PresentationSent = "presentation-sent",
    PresentationReceived = "presentation-received",
    Declined = "declined",
    Done = "done"
}

export declare interface ProofStateChangedEvent extends BaseEvent {
    type: typeof ProofEventTypes.ProofStateChanged;
    payload: {
        proofRecord: ProofRecord;
        previousState: ProofState | null;
    };
}

/**
 * Message part of Issue Credential Protocol used to initiate credential exchange by prover.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#propose-credential
 */
export declare class ProposeCredentialMessage extends AgentMessage {
    constructor(options: ProposeCredentialMessageOptions);
    readonly type = "https://didcomm.org/issue-credential/1.0/propose-credential";
    static readonly type = "https://didcomm.org/issue-credential/1.0/propose-credential";
    /**
     * Human readable information about this Credential Proposal,
     * so the proposal can be evaluated by human judgment.
     */
    comment?: string;
    /**
     * Represents the credential data that Prover wants to receive.
     */
    credentialProposal?: CredentialPreview;
    /**
     * Filter to request credential based on a particular Schema issuer DID.
     */
    schemaIssuerDid?: string;
    /**
     * Filter to request credential based on a particular Schema.
     */
    schemaId?: string;
    /**
     * Filter to request credential based on a schema name.
     */
    schemaName?: string;
    /**
     * Filter  to request credential based on a schema version.
     */
    schemaVersion?: string;
    /**
     * Filter to request credential based on a particular Credential Definition.
     */
    credentialDefinitionId?: string;
    /**
     * Filter to request a credential issued by the owner of a particular DID.
     */
    issuerDid?: string;
}

export declare interface ProposeCredentialMessageOptions {
    id?: string;
    comment?: string;
    credentialProposal?: CredentialPreview;
    schemaIssuerDid?: string;
    schemaId?: string;
    schemaName?: string;
    schemaVersion?: string;
    credentialDefinitionId?: string;
    issuerDid?: string;
    attachments?: Attachment[];
}

/**
 * Propose Presentation Message part of Present Proof Protocol used to initiate presentation exchange by holder.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#propose-presentation
 */
export declare class ProposePresentationMessage extends AgentMessage {
    constructor(options: ProposePresentationMessageOptions);
    readonly type = "https://didcomm.org/present-proof/1.0/propose-presentation";
    static readonly type = "https://didcomm.org/present-proof/1.0/propose-presentation";
    /**
     * Provides some human readable information about the proposed presentation.
     */
    comment?: string;
    /**
     * Represents the presentation example that prover wants to provide.
     */
    presentationProposal: PresentationPreview;
}

export declare interface ProposePresentationMessageOptions {
    id?: string;
    comment?: string;
    presentationProposal: PresentationPreview;
}

export declare interface PublicDidRequest {
    did: Indy.GetNymResponse;
    pool: IndyPool;
    response: Indy.LedgerReadReplyResponse;
}

export declare class PublicKey {
    constructor(options: {
        id: string;
        controller: string;
        type: string;
        value?: string;
    });
    id: string;
    controller: string;
    type: string;
    value?: string;
}

/**
 * Decorator that transforms public key json to corresonding class instances. See {@link publicKeyTypes}
 *
 * @example
 * class Example {
 *   ＠PublicKeyTransformer()
 *   private publicKey: PublicKey
 * }
 */
export declare function PublicKeyTransformer(): PropertyDecorator;

export declare const publicKeyTypes: {
    [key: string]: unknown | undefined;
};

declare type Query<T extends BaseRecord> = Partial<ReturnType<T['getTags']>>;

declare class QueryMessage extends AgentMessage {
    constructor(options: DiscoverFeaturesQueryMessageOptions);
    readonly type = "https://didcomm.org/discover-features/1.0/query";
    static readonly type = "https://didcomm.org/discover-features/1.0/query";
    query: string;
    comment?: string;
}

export declare class RecipientModule {
    private agentConfig;
    private mediationRecipientService;
    private connectionService;
    private messageSender;
    private messageReceiver;
    private eventEmitter;
    private logger;
    private discoverFeaturesModule;
    private mediationRepository;
    constructor(dispatcher: Dispatcher, agentConfig: AgentConfig, mediationRecipientService: MediationRecipientService, connectionService: ConnectionService, messageSender: MessageSender, messageReceiver: MessageReceiver, eventEmitter: EventEmitter, discoverFeaturesModule: DiscoverFeaturesModule, mediationRepository: MediationRepository);
    initialize(): Promise<void>;
    private sendMessage;
    private openMediationWebSocket;
    private openWebSocketAndPickUp;
    initiateMessagePickup(mediator: MediationRecord): Promise<Subscription | undefined>;
    private getPickupStrategyForMediator;
    discoverMediation(): Promise<MediationRecord | undefined>;
    pickupMessages(mediatorConnection: ConnectionRecord): Promise<void>;
    setDefaultMediator(mediatorRecord: MediationRecord): Promise<void>;
    requestMediation(connection: ConnectionRecord): Promise<MediationRecord>;
    notifyKeylistUpdate(connection: ConnectionRecord, verkey: string): Promise<void>;
    findByConnectionId(connectionId: string): Promise<MediationRecord | null>;
    getMediators(): Promise<MediationRecord[]>;
    findDefaultMediator(): Promise<MediationRecord | null>;
    findDefaultMediatorConnection(): Promise<ConnectionRecord | null>;
    requestAndAwaitGrant(connection: ConnectionRecord, timeoutMs?: number): Promise<MediationRecord>;
    provision(mediatorConnInvite: string): Promise<MediationRecord | null>;
    private registerHandlers;
}

export declare class RecordDuplicateError extends AriesFrameworkError {
    constructor(message: string, { recordType, cause }: {
        recordType: string;
        cause?: Error;
    });
}

export declare class RecordNotFoundError extends AriesFrameworkError {
    constructor(message: string, { recordType, cause }: {
        recordType: string;
        cause?: Error;
    });
}

declare type RecordTags<Record extends BaseRecord> = ReturnType<Record['getTags']>;

export declare class ReferencedAuthentication extends Authentication {
    constructor(publicKey: PublicKey, type: string);
    type: string;
    publicKey: PublicKey;
}

export declare class Repository<T extends BaseRecord<any, any, any>> {
    private storageService;
    private recordClass;
    constructor(recordClass: BaseRecordConstructor<T>, storageService: StorageService<T>);
    /** @inheritDoc {StorageService#save} */
    save(record: T): Promise<void>;
    /** @inheritDoc {StorageService#update} */
    update(record: T): Promise<void>;
    /** @inheritDoc {StorageService#delete} */
    delete(record: T): Promise<void>;
    /** @inheritDoc {StorageService#getById} */
    getById(id: string): Promise<T>;
    /**
     * Find record by id. Returns null if no record is found
     * @param id the id of the record to retrieve
     * @returns
     */
    findById(id: string): Promise<T | null>;
    /** @inheritDoc {StorageService#getAll} */
    getAll(): Promise<T[]>;
    /** @inheritDoc {StorageService#findByQuery} */
    findByQuery(query: Query<T>): Promise<T[]>;
    /**
     * Find a single record by query. Returns null if not found.
     * @param query the query
     * @returns the record, or null if not found
     * @throws {RecordDuplicateError} if multiple records are found for the given query
     */
    findSingleByQuery(query: Query<T>): Promise<T | null>;
    /**
     * Find a single record by query. Throws if not found
     * @param query the query
     * @returns the record
     * @throws {RecordDuplicateError} if multiple records are found for the given query
     * @throws {RecordNotFoundError} if no record is found for the given query
     */
    getSingleByQuery(query: Query<T>): Promise<T>;
}

export declare class RequestCredentialMessage extends AgentMessage {
    constructor(options: RequestCredentialMessageOptions);
    readonly type = "https://didcomm.org/issue-credential/1.0/request-credential";
    static readonly type = "https://didcomm.org/issue-credential/1.0/request-credential";
    comment?: string;
    requestAttachments: Attachment[];
    get indyCredentialRequest(): CredReq | null;
}

declare interface RequestCredentialMessageOptions {
    id?: string;
    comment?: string;
    requestAttachments: Attachment[];
    attachments?: Attachment[];
}

/**
 * Requested Attribute for Indy proof creation
 */
export declare class RequestedAttribute {
    constructor(options: RequestedAttribute);
    credentialId: string;
    timestamp?: number;
    revealed: boolean;
    credentialInfo?: IndyCredentialInfo;
    revoked?: boolean;
}

/**
 * Requested Credentials for Indy proof creation
 *
 * @see https://github.com/hyperledger/indy-sdk/blob/57dcdae74164d1c7aa06f2cccecaae121cefac25/libindy/src/api/anoncreds.rs#L1433-L1445
 */
export declare class RequestedCredentials {
    constructor(options?: RequestedCredentialsOptions);
    requestedAttributes: Record<string, RequestedAttribute>;
    requestedPredicates: Record<string, RequestedPredicate>;
    selfAttestedAttributes: Record<string, string>;
    toJSON(): IndyRequestedCredentials;
    getCredentialIdentifiers(): string[];
}

declare interface RequestedCredentialsOptions {
    requestedAttributes?: Record<string, RequestedAttribute>;
    requestedPredicates?: Record<string, RequestedPredicate>;
    selfAttestedAttributes?: Record<string, string>;
}

/**
 * Requested Predicate for Indy proof creation
 */
export declare class RequestedPredicate {
    constructor(options: RequestedPredicate);
    credentialId: string;
    timestamp?: number;
    credentialInfo?: IndyCredentialInfo;
    revoked?: boolean;
}

export declare class RequestedProof {
    constructor(options: RequestedProof);
    revealedAttributes: Map<string, ProofAttribute>;
    selfAttestedAttributes: Map<string, string>;
}

/**
 * Request Presentation Message part of Present Proof Protocol used to initiate request from verifier to prover.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#request-presentation
 */
export declare class RequestPresentationMessage extends AgentMessage {
    constructor(options: RequestPresentationOptions);
    readonly type = "https://didcomm.org/present-proof/1.0/request-presentation";
    static readonly type = "https://didcomm.org/present-proof/1.0/request-presentation";
    /**
     *  Provides some human readable information about this request for a presentation.
     */
    comment?: string;
    /**
     * An array of attachments defining the acceptable formats for the presentation.
     */
    requestPresentationAttachments: Attachment[];
    get indyProofRequest(): ProofRequest | null;
}

export declare interface RequestPresentationOptions {
    id?: string;
    comment?: string;
    requestPresentationAttachments: Attachment[];
}

/**
 * Lists of requested credentials for Indy proof creation
 */
export declare class RetrievedCredentials {
    requestedAttributes: Record<string, RequestedAttribute[]>;
    requestedPredicates: Record<string, RequestedPredicate[]>;
    constructor(options?: RetrievedCredentialsOptions);
}

export declare interface RetrievedCredentialsOptions {
    requestedAttributes?: Record<string, RequestedAttribute[]>;
    requestedPredicates?: Record<string, RequestedPredicate[]>;
}

/**
 * Return route types.
 */
declare enum ReturnRouteTypes {
    /** No messages should be returned over this connection. */
    none = "none",
    /**  All messages for this key should be returned over this connection. */
    all = "all",
    /** Send all messages matching this thread over this connection. */
    thread = "thread"
}

export declare class RevocationInterval {
    constructor(options: {
        from?: number;
        to?: number;
    });
    from?: number;
    to?: number;
}

export declare class RevocationNotification {
    revocationDate: Date;
    comment?: string;
    constructor(comment?: string, revocationDate?: Date);
}

export declare interface RevocationNotificationMessageV1Options {
    issueThread: string;
    id?: string;
    comment?: string;
    pleaseAck?: AckDecorator;
}

export declare interface RevocationNotificationMessageV2Options {
    revocationFormat: string;
    credentialId: string;
    id?: string;
    comment?: string;
    pleaseAck?: AckDecorator;
}

export declare interface RevocationNotificationReceivedEvent extends BaseEvent {
    type: typeof CredentialEventTypes.RevocationNotificationReceived;
    payload: {
        credentialRecord: CredentialRecord;
    };
}

export declare class RevocationService {
    private credentialRepository;
    private eventEmitter;
    private logger;
    constructor(credentialRepository: CredentialRepository, eventEmitter: EventEmitter, agentConfig: AgentConfig);
    private processRevocationNotification;
    /**
     * Process a recieved {@link V1RevocationNotificationMessage}. This will create a
     * {@link RevocationNotification} and store it in the corresponding {@link CredentialRecord}
     *
     * @param messageContext message context of RevocationNotificationMessageV1
     */
    v1ProcessRevocationNotification(messageContext: InboundMessageContext<V1RevocationNotificationMessage>): Promise<void>;
    /**
     * Process a recieved {@link V2RevocationNotificationMessage}. This will create a
     * {@link RevocationNotification} and store it in the corresponding {@link CredentialRecord}
     *
     * @param messageContext message context of RevocationNotificationMessageV2
     */
    v2ProcessRevocationNotification(messageContext: InboundMessageContext<V2RevocationNotificationMessage>): Promise<void>;
}

export declare interface Routing {
    endpoints: string[];
    verkey: string;
    did: string;
    routingKeys: string[];
    mediatorId?: string;
}

export declare enum RoutingEventTypes {
    MediationStateChanged = "MediationStateChanged",
    RecipientKeylistUpdated = "RecipientKeylistUpdated"
}

export declare class RsaSig2018 extends PublicKey {
    constructor(options: {
        id: string;
        controller: string;
        publicKeyPem: string;
    });
    type: "RsaVerificationKey2018";
    value: string;
}

export declare interface SchemaTemplate {
    name: string;
    version: string;
    attributes: string[];
}

/**
 * Represents `~service` decorator
 *
 * Based on specification Aries RFC 0056: Service Decorator
 * @see https://github.com/hyperledger/aries-rfcs/tree/master/features/0056-service-decorator
 */
declare class ServiceDecorator {
    constructor(options: ServiceDecoratorOptions);
    recipientKeys: string[];
    routingKeys?: string[];
    serviceEndpoint: string;
    toDidCommService(id?: string): DidCommService;
}

declare interface ServiceDecoratorOptions {
    recipientKeys: string[];
    routingKeys?: string[];
    serviceEndpoint: string;
}

/**
 * Represents `[field]~sig` decorator
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0234-signature-decorator/README.md
 */
declare class SignatureDecorator {
    constructor(options: SignatureDecorator);
    signatureType: string;
    signatureData: string;
    signer: string;
    signature: string;
}

export declare class StatusMessage extends AgentMessage {
    constructor(options: StatusMessageOptions);
    readonly type = "https://didcomm.org/messagepickup/2.0/status";
    static readonly type = "https://didcomm.org/messagepickup/2.0/status";
    recipientKey?: string;
    messageCount: number;
    longestWaitedSeconds?: number;
    newestReceivedTime?: Date;
    oldestReceivedTime?: Date;
    totalBytes?: number;
    liveDelivery?: boolean;
}

export declare interface StatusMessageOptions {
    id?: string;
    recipientKey?: string;
    messageCount: number;
    longestWaitedSeconds?: number;
    newestReceivedTime?: Date;
    oldestReceivedTime?: Date;
    totalBytes?: number;
    liveDelivery?: boolean;
}

export declare class StatusRequestMessage extends AgentMessage {
    constructor(options: StatusRequestMessageOptions);
    readonly type = "https://didcomm.org/messagepickup/2.0/status-request";
    static readonly type = "https://didcomm.org/messagepickup/2.0/status-request";
    recipientKey?: string;
}

export declare interface StatusRequestMessageOptions {
    id?: string;
    recipientKey?: string;
}

export declare interface StorageService<T extends BaseRecord<any, any, any>> {
    /**
     * Save record in storage
     *
     * @param record the record to store
     * @throws {RecordDuplicateError} if a record with this id already exists
     */
    save(record: T): Promise<void>;
    /**
     * Update record in storage
     *
     * @param record the record to update
     * @throws {RecordNotFoundError} if a record with this id and type does not exist
     */
    update(record: T): Promise<void>;
    /**
     * Delete record from storage
     *
     * @param record the record to delete
     * @throws {RecordNotFoundError} if a record with this id and type does not exist
     */
    delete(record: T): Promise<void>;
    /**
     * Get record by id.
     *
     * @param recordClass the record class to get the record for
     * @param id the id of the record to retrieve from storage
     * @throws {RecordNotFoundError} if a record with this id and type does not exist
     */
    getById(recordClass: BaseRecordConstructor<T>, id: string): Promise<T>;
    /**
     * Get all records by specified record class.
     *
     * @param recordClass the record class to get records for
     */
    getAll(recordClass: BaseRecordConstructor<T>): Promise<T[]>;
    /**
     * Find all records by specified record class and query.
     *
     * @param recordClass the record class to find records for
     * @param query the query to use for finding records
     */
    findByQuery(recordClass: BaseRecordConstructor<T>, query: Query<T>): Promise<T[]>;
}

declare class StorageUpdateService {
    private static STORAGE_VERSION_RECORD_ID;
    private logger;
    private storageVersionRepository;
    constructor(agentConfig: AgentConfig, storageVersionRepository: StorageVersionRepository);
    isUpToDate(): Promise<boolean>;
    getCurrentStorageVersion(): Promise<VersionString>;
    setCurrentStorageVersion(storageVersion: VersionString): Promise<void>;
    /**
     * Retrieve the update record, creating it if it doesn't exist already.
     *
     * The storageVersion will be set to the INITIAL_STORAGE_VERSION if it doesn't exist yet,
     * as we can assume the wallet was created before the udpate record existed
     */
    getStorageVersionRecord(): Promise<StorageVersionRecord>;
}

declare class StorageVersionRecord extends BaseRecord {
    storageVersion: VersionString;
    static readonly type = "StorageVersionRecord";
    readonly type = "StorageVersionRecord";
    constructor(props: StorageVersionRecordProps);
    getTags(): TagsBase;
}

declare interface StorageVersionRecordProps {
    id?: string;
    createdAt?: Date;
    storageVersion: VersionString;
}

declare class StorageVersionRepository extends Repository<StorageVersionRecord> {
    constructor(storageService: StorageService<StorageVersionRecord>);
}

declare interface StoreCredentialOptions {
    credentialRequestMetadata: Indy.CredReqMetadata;
    credential: Indy.Cred;
    credentialDefinition: Indy.CredDef;
    credentialId?: Indy.CredentialId;
    revocationRegistryDefinition?: Indy.RevocRegDef;
}

declare type Tags<DefaultTags extends TagsBase, CustomTags extends TagsBase> = CustomTags & DefaultTags;

declare type TagsBase = {
    [key: string]: TagValue;
    [key: number]: never;
};

declare type TagValue = string | boolean | undefined | Array<string>;

/**
 * Represents `~thread` decorator
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/concepts/0008-message-id-and-threading/README.md
 */
declare class ThreadDecorator {
    constructor(partial?: Partial<ThreadDecorator>);
    /**
     * The ID of the message that serves as the thread start.
     */
    threadId?: string;
    /**
     * An optional parent `thid`. Used when branching or nesting a new interaction off of an existing one.
     */
    parentThreadId?: string;
    /**
     * A number that tells where this message fits in the sequence of all messages that the current sender has contributed to this thread.
     */
    senderOrder?: number;
    /**
     * Reports the highest `sender_order` value that the sender has seen from other sender(s) on the thread.
     * This value is often missing if it is the first message in an interaction, but should be used otherwise, as it provides an implicit ACK.
     */
    receivedOrders?: {
        [key: string]: number;
    };
}

/**
 * Represents `~timing` decorator
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0032-message-timing/README.md
 */
declare class TimingDecorator {
    constructor(partial?: Partial<TimingDecorator>);
    /**
     * The timestamp when the preceding message in this thread (the one that elicited this message as a response) was received.
     * Or, on a dynamically composed forward message, the timestamp when an upstream relay first received the message it's now asking to be forwarded.
     */
    inTime?: Date;
    /**
     * The timestamp when the message was emitted. At least millisecond precision is preferred, though second precision is acceptable.
     */
    outTime?: Date;
    /**
     * Ideally, the decorated message should be processed by the the specified timestamp. After that, the message may become irrelevant or less meaningful than intended.
     * This is a hint only.
     */
    staleTime?: Date;
    /**
     * The decorated message should be considered invalid or expired if encountered after the specified timestamp.
     * This is a much stronger claim than the one for `stale_time`; it says that the receiver should cancel attempts to process it once the deadline is past,
     * because the sender won't stand behind it any longer. While processing of the received message should stop,
     * the thread of the message should be retained as the sender may send an updated/replacement message.
     * In the case that the sender does not follow up, the policy of the receiver agent related to abandoned threads would presumably be used to eventually delete the thread.
     */
    expiresTime?: Date;
    /**
     * Wait at least this many milliseconds before processing the message. This may be useful to defeat temporal correlation.
     * It is recommended that agents supporting this field should not honor requests for delays longer than 10 minutes (600,000 milliseconds).
     */
    delayMilli?: number;
    /**
     * Wait until this time before processing the message.
     */
    waitUntilTime?: Date;
}

/**
 * Represents `~transport` decorator
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0092-transport-return-route/README.md
 */
declare class TransportDecorator {
    constructor(partial?: Partial<TransportDecorator>);
    returnRoute?: ReturnRouteTypes;
    returnRouteThread?: string;
}

export declare enum TransportEventTypes {
    OutboundWebSocketClosedEvent = "OutboundWebSocketClosedEvent"
}

declare interface TransportPriorityOptions {
    schemes: string[];
    restrictive?: boolean;
}

export declare class TransportService {
    private transportSessionTable;
    saveSession(session: TransportSession): void;
    findSessionByConnectionId(connectionId: string): TransportSession | undefined;
    hasInboundEndpoint(didDoc: DidDoc): boolean;
    findSessionById(sessionId: string): TransportSession | undefined;
    removeSession(session: TransportSession): void;
    findDidCommServices(connection: ConnectionRecord): Array<DidCommService | IndyAgentService>;
}

export declare interface TransportSession {
    id: string;
    type: string;
    keys?: EnvelopeKeys;
    inboundMessage?: AgentMessage;
    connection?: ConnectionRecord;
    send(encryptedMessage: EncryptedMessage): Promise<void>;
    close(): Promise<void>;
}

/**
 * Message to initiate trust ping interaction
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0048-trust-ping/README.md#messages
 */
export declare class TrustPingMessage extends AgentMessage {
    /**
     * Create new TrustPingMessage instance.
     * responseRequested will be true if not passed
     * @param options
     */
    constructor(options: TrustPingMessageOptions);
    readonly type = "https://didcomm.org/trust_ping/1.0/ping";
    static readonly type = "https://didcomm.org/trust_ping/1.0/ping";
    comment?: string;
    responseRequested: boolean;
}

export declare interface TrustPingMessageOptions {
    comment?: string;
    id?: string;
    responseRequested?: boolean;
    timing?: Pick<TimingDecorator, 'outTime' | 'expiresTime' | 'delayMilli'>;
}

/**
 * Message to respond to a trust ping message
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0048-trust-ping/README.md#messages
 */
export declare class TrustPingResponseMessage extends AgentMessage {
    /**
     * Create new TrustPingResponseMessage instance.
     * responseRequested will be true if not passed
     * @param options
     */
    constructor(options: TrustPingResponseMessageOptions);
    readonly type = "https://didcomm.org/trust_ping/1.0/ping_response";
    static readonly type = "https://didcomm.org/trust_ping/1.0/ping_response";
    comment?: string;
}

export declare interface TrustPingResponseMessageOptions {
    comment?: string;
    id?: string;
    threadId: string;
    timing?: Pick<TimingDecorator, 'inTime' | 'outTime'>;
}

export declare class TrustPingService {
    processPing({ message }: InboundMessageContext<TrustPingMessage>, connection: ConnectionRecord): OutboundMessage<TrustPingResponseMessage> | undefined;
    processPingResponse(inboundMessage: InboundMessageContext<TrustPingResponseMessage>): void;
}

export declare const utils: {
    uuid: typeof uuid;
};

declare function uuid(): string;

export declare class V1RevocationNotificationMessage extends AgentMessage {
    constructor(options: RevocationNotificationMessageV1Options);
    readonly type = "https://didcomm.org/revocation_notification/1.0/revoke";
    static readonly type = "https://didcomm.org/revocation_notification/1.0/revoke";
    comment?: string;
    issueThread: string;
}

export declare class V2RevocationNotificationMessage extends AgentMessage {
    constructor(options: RevocationNotificationMessageV2Options);
    readonly type = "https://didcomm.org/revocation_notification/2.0/revoke";
    static readonly type = "https://didcomm.org/revocation_notification/2.0/revoke";
    comment?: string;
    revocationFormat: string;
    credentialId: string;
}

declare class VerificationMethod {
    constructor(options: VerificationMethodOptions);
    id: string;
    type: string;
    controller: string;
    publicKeyBase58?: string;
    publicKeyBase64?: string;
    publicKeyJwk?: Record<string, unknown>;
    publicKeyHex?: string;
    publicKeyMultibase?: string;
    publicKeyPem?: string;
    blockchainAccountId?: string;
    ethereumAddress?: string;
}

declare interface VerificationMethodOptions {
    id: string;
    type: string;
    controller: string;
    publicKeyBase58?: string;
    publicKeyBase64?: string;
    publicKeyJwk?: Record<string, unknown>;
    publicKeyHex?: string;
    publicKeyMultibase?: string;
    publicKeyPem?: string;
    blockchainAccountId?: string;
    ethereumAddress?: string;
}

declare interface VerifyProofOptions {
    proofRequest: Indy.IndyProofRequest;
    proof: Indy.IndyProof;
    schemas: Indy.Schemas;
    credentialDefinitions: Indy.CredentialDefs;
}

declare type VersionString = `${number}.${number}`;

export declare interface Wallet {
    publicDid: DidInfo | undefined;
    isInitialized: boolean;
    isProvisioned: boolean;
    create(walletConfig: WalletConfig): Promise<void>;
    createAndOpen(walletConfig: WalletConfig): Promise<void>;
    open(walletConfig: WalletConfig): Promise<void>;
    rotateKey(walletConfig: WalletConfigRekey): Promise<void>;
    close(): Promise<void>;
    delete(): Promise<void>;
    export(exportConfig: WalletExportImportConfig): Promise<void>;
    import(walletConfig: WalletConfig, importConfig: WalletExportImportConfig): Promise<void>;
    initPublicDid(didConfig: DidConfig): Promise<void>;
    createDid(didConfig?: DidConfig): Promise<DidInfo>;
    pack(payload: Record<string, unknown>, recipientKeys: string[], senderVerkey?: string): Promise<EncryptedMessage>;
    unpack(encryptedMessage: EncryptedMessage): Promise<DecryptedMessageContext>;
    sign(data: Buffer_2, verkey: string): Promise<Buffer_2>;
    verify(signerVerkey: string, data: Buffer_2, signature: Buffer_2): Promise<boolean>;
    generateNonce(): Promise<string>;
}

declare interface WalletConfig {
    id: string;
    key: string;
    keyDerivationMethod?: KeyDerivationMethod;
}

declare interface WalletConfigRekey {
    id: string;
    key: string;
    rekey: string;
    keyDerivationMethod?: KeyDerivationMethod;
    rekeyDerivationMethod?: KeyDerivationMethod;
}

export declare class WalletDuplicateError extends AriesFrameworkError {
    constructor(message: string, { walletType, cause }: {
        walletType: string;
        cause?: Error;
    });
}

export declare class WalletError extends AriesFrameworkError {
    constructor(message: string, { cause }?: {
        cause?: Error;
    });
}

declare interface WalletExportImportConfig {
    key: string;
    path: string;
}

export declare class WalletInvalidKeyError extends AriesFrameworkError {
    constructor(message: string, { walletType, cause }: {
        walletType: string;
        cause?: Error;
    });
}

declare class WalletModule {
    private wallet;
    private storageUpdateService;
    private logger;
    private _walletConfig?;
    constructor(wallet: Wallet, storageUpdateService: StorageUpdateService, agentConfig: AgentConfig);
    get isInitialized(): boolean;
    get isProvisioned(): boolean;
    get walletConfig(): WalletConfig | undefined;
    initialize(walletConfig: WalletConfig): Promise<void>;
    createAndOpen(walletConfig: WalletConfig): Promise<void>;
    create(walletConfig: WalletConfig): Promise<void>;
    open(walletConfig: WalletConfig): Promise<void>;
    close(): Promise<void>;
    rotateKey(walletConfig: WalletConfigRekey): Promise<void>;
    delete(): Promise<void>;
    export(exportConfig: WalletExportImportConfig): Promise<void>;
    import(walletConfig: WalletConfig, importConfig: WalletExportImportConfig): Promise<void>;
}

export declare class WalletNotFoundError extends AriesFrameworkError {
    constructor(message: string, { walletType, cause }: {
        walletType: string;
        cause?: Error;
    });
}

declare enum WhereStatus {
    Cloud = "CLOUD",
    Edge = "EDGE",
    Wire = "WIRE",
    Agency = "AGENCY"
}

declare enum WhoRetriesStatus {
    You = "YOU",
    Me = "ME",
    Both = "BOTH",
    None = "NONE"
}

export declare class WsOutboundTransport implements OutboundTransport {
    private transportTable;
    private agent;
    private logger;
    private eventEmitter;
    private WebSocketClass;
    supportedSchemes: string[];
    start(agent: Agent): Promise<void>;
    stop(): Promise<void>;
    sendMessage(outboundPackage: OutboundPackage): Promise<void>;
    private hasOpenSocket;
    private resolveSocket;
    private handleMessageEvent;
    private listenOnWebSocketMessages;
    private createSocketConnection;
}

export { }
