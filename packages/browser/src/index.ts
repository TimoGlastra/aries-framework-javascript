import type { AgentDependencies } from '@aries-framework/core'

import { EventEmitter } from 'events'

import { LocalStorageFileSystem } from './LocalStorageFileSystem'

const fetch = window.fetch as unknown as AgentDependencies['fetch']
const WebSocket = window.WebSocket as unknown as AgentDependencies['WebSocketClass']

const agentDependencies: AgentDependencies = {
  fetch,
  EventEmitterClass: EventEmitter,
  WebSocketClass: WebSocket,
  FileSystem: LocalStorageFileSystem,
}

export { agentDependencies }
