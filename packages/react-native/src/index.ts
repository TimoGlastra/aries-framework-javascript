import 'react-native-get-random-values'
import '@azure/core-asynciterator-polyfill'

import type { AgentDependenciesWithIndy } from '@aries-framework/core'

import { EventEmitter } from 'events'
// Eslint complains indy-sdk-react-native has no default export
// But that's not true
// eslint-disable-next-line import/default
import indy from 'indy-sdk-react-native'

import { ReactNativeFileSystem } from './ReactNativeFileSystem'

const fetch = global.fetch as unknown as AgentDependenciesWithIndy['fetch']
const WebSocket = global.WebSocket as unknown as AgentDependenciesWithIndy['WebSocketClass']

const agentDependencies: AgentDependenciesWithIndy = {
  FileSystem: ReactNativeFileSystem,
  fetch,
  EventEmitterClass: EventEmitter,
  WebSocketClass: WebSocket,
  indy,
}

export { agentDependencies }
