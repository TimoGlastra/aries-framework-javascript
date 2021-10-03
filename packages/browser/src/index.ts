import type { AgentDependenciesWithoutIndy } from '@aries-framework/core'

import { EventEmitter } from 'events'

import { LocalStorageFileSystem } from './LocalStorageFileSystem'

const fetch = window.fetch as unknown as AgentDependenciesWithoutIndy['fetch']
const WebSocket = window.WebSocket as unknown as AgentDependenciesWithoutIndy['WebSocketClass']

const agentDependencies: AgentDependenciesWithoutIndy = {
  fetch,
  EventEmitterClass: EventEmitter,
  WebSocketClass: WebSocket,
  FileSystem: LocalStorageFileSystem,
  indy: undefined,
}

export { agentDependencies }
