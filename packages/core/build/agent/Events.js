"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentEventTypes = void 0;
exports.filterContextCorrelationId = filterContextCorrelationId;
const rxjs_1 = require("rxjs");
function filterContextCorrelationId(contextCorrelationId) {
    return (source) => {
        return source.pipe((0, rxjs_1.filter)((event) => event.metadata.contextCorrelationId === contextCorrelationId));
    };
}
var AgentEventTypes;
(function (AgentEventTypes) {
    AgentEventTypes["AgentMessageReceived"] = "AgentMessageReceived";
    AgentEventTypes["AgentMessageProcessed"] = "AgentMessageProcessed";
    AgentEventTypes["AgentMessageSent"] = "AgentMessageSent";
})(AgentEventTypes || (exports.AgentEventTypes = AgentEventTypes = {}));
//# sourceMappingURL=Events.js.map