import type { AgentDependenciesWithoutIndy } from '@aries-framework/core'

import { EventEmitter } from 'events'

import { BrowserWallet } from './BrowserWallet'
import { LocalStorageFileSystem } from './LocalStorageFileSystem'
import { PouchStorageService } from './PouchStorageService'

const fetch = window.fetch.bind(window) as unknown as AgentDependenciesWithoutIndy['fetch']
const WebSocket = window.WebSocket.bind(window) as unknown as AgentDependenciesWithoutIndy['WebSocketClass']

const agentDependencies: AgentDependenciesWithoutIndy = {
  fetch,
  EventEmitterClass: EventEmitter,
  WebSocketClass: WebSocket,
  FileSystem: LocalStorageFileSystem,
  indy: undefined,
  Wallet: BrowserWallet,
  StorageService: PouchStorageService,
}

export { agentDependencies }
