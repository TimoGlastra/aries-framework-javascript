import type { FileSystem } from '../storage/FileSystem'
import type { StorageService } from '../storage/StorageService'
import type { Constructor } from '../utils/mixins'
import type { Wallet } from '../wallet/Wallet'
import type { EventEmitter } from 'events'
import type * as Indy from 'indy-sdk'
import type fetch from 'node-fetch'
import type WebSocket from 'ws'

export interface AgentDependenciesBase {
  EventEmitterClass: typeof EventEmitter
  fetch: typeof fetch
  WebSocketClass: typeof WebSocket
  FileSystem: Constructor<FileSystem>
  Wallet?: Constructor<Wallet>
  StorageService?: Constructor<StorageService>
}

export interface AgentDependenciesWithIndy extends AgentDependenciesBase {
  indy: typeof Indy
}

export interface AgentDependenciesWithoutIndy extends AgentDependenciesBase {
  indy: undefined
}

export type AgentDependencies = AgentDependenciesWithoutIndy | AgentDependenciesWithIndy
