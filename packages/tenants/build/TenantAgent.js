"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAgent = void 0;
const core_1 = require("@credo-ts/core");
class TenantAgent extends core_1.BaseAgent {
    constructor(agentContext) {
        super(agentContext.config, agentContext.dependencyManager);
        this.sessionHasEnded = false;
    }
    async initialize() {
        if (this.sessionHasEnded) {
            throw new core_1.CredoError("Can't initialize agent after tenant sessions has been ended.");
        }
        await super.initialize();
        this._isInitialized = true;
    }
    async endSession() {
        this.logger.trace(`Ending session for agent context with contextCorrelationId '${this.agentContext.contextCorrelationId}'`);
        await this.agentContext.endSession();
        this._isInitialized = false;
        this.sessionHasEnded = true;
    }
}
exports.TenantAgent = TenantAgent;
//# sourceMappingURL=TenantAgent.js.map