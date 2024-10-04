"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheqdApi = void 0;
const core_1 = require("@credo-ts/core");
const tsyringe_1 = require("tsyringe");
const dids_1 = require("./dids");
let CheqdApi = class CheqdApi {
    constructor(agentContext) {
        this.agentContext = agentContext;
    }
    async createResource(did, options) {
        const cheqdDidRegistrar = this.agentContext.dependencyManager.resolve(dids_1.CheqdDidRegistrar);
        return await cheqdDidRegistrar.createResource(this.agentContext, did, options);
    }
    async resolveResource(resourceUrl) {
        const cheqdDidResolver = this.agentContext.dependencyManager.resolve(dids_1.CheqdDidResolver);
        return await cheqdDidResolver.resolveResource(this.agentContext, resourceUrl);
    }
};
exports.CheqdApi = CheqdApi;
exports.CheqdApi = CheqdApi = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [core_1.AgentContext])
], CheqdApi);
//# sourceMappingURL=CheqdApi.js.map