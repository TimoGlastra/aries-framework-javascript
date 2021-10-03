// reflect-metadata used for class-transformer + class-validator
import 'reflect-metadata'

export { Agent } from './agent/Agent'
export { AgentConfig } from './agent/AgentConfig'
export type {
  AgentDependencies,
  AgentDependenciesWithIndy,
  AgentDependenciesWithoutIndy,
} from './agent/AgentDependencies'
export type { InitConfig, OutboundPackage, WireMessage, WalletConfig, UnpackedMessageContext } from './types'
export { DidCommMimeType } from './types'
export type { FileSystem } from './storage/FileSystem'
export { InMemoryMessageRepository } from './storage/InMemoryMessageRepository'
export { BaseRecord, TagsBase } from './storage/BaseRecord'
export { StorageService, BaseRecordConstructor } from './storage/StorageService'
export { getDirFromFilePath } from './utils/path'
export { InjectionSymbols } from './constants'
export type { Wallet, DidInfo, DidConfig } from './wallet/Wallet'
export type { TransportSession } from './agent/TransportService'
export { TransportService } from './agent/TransportService'

import { JsonEncoder } from './utils/JsonEncoder'
import { uuid } from './utils/uuid'
export { Buffer } from './utils/buffer'

export * from './transport'
export * from './modules/basic-messages'
export * from './modules/credentials'
export * from './modules/proofs'
export * from './modules/connections'
export * from './modules/ledger'
export * from './modules/routing'
export * from './utils/JsonTransformer'
export * from './logger'
export * from './error'
export * from './wallet/error'

const utils = {
  uuid,
  JsonEncoder,
}

export { utils }
