"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentDependencies = void 0;
require("react-native-get-random-values");
require("@azure/core-asynciterator-polyfill");
const events_1 = require("events");
const ReactNativeFileSystem_1 = require("./ReactNativeFileSystem");
const fetch = global.fetch;
const WebSocket = global.WebSocket;
const agentDependencies = {
    FileSystem: ReactNativeFileSystem_1.ReactNativeFileSystem,
    fetch,
    EventEmitterClass: events_1.EventEmitter,
    WebSocketClass: WebSocket,
};
exports.agentDependencies = agentDependencies;
//# sourceMappingURL=index.js.map