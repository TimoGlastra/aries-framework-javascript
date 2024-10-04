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
exports.ActionMenuRecord = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const models_1 = require("../models");
/**
 * @public
 */
class ActionMenuRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c;
        super();
        this.type = ActionMenuRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this.connectionId = props.connectionId;
            this.threadId = props.threadId;
            this.state = props.state;
            this.role = props.role;
            this.menu = props.menu;
            this.performedAction = props.performedAction;
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { role: this.role, connectionId: this.connectionId, threadId: this.threadId });
    }
    assertState(expectedStates) {
        if (!Array.isArray(expectedStates)) {
            expectedStates = [expectedStates];
        }
        if (!expectedStates.includes(this.state)) {
            throw new core_1.CredoError(`Action Menu record is in invalid state ${this.state}. Valid states are: ${expectedStates.join(', ')}.`);
        }
    }
    assertRole(expectedRole) {
        if (this.role !== expectedRole) {
            throw new core_1.CredoError(`Action Menu record has invalid role ${this.role}. Expected role ${expectedRole}.`);
        }
    }
}
exports.ActionMenuRecord = ActionMenuRecord;
ActionMenuRecord.type = 'ActionMenuRecord';
__decorate([
    (0, class_transformer_1.Type)(() => models_1.ActionMenu),
    __metadata("design:type", models_1.ActionMenu)
], ActionMenuRecord.prototype, "menu", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => models_1.ActionMenuSelection),
    __metadata("design:type", models_1.ActionMenuSelection)
], ActionMenuRecord.prototype, "performedAction", void 0);
//# sourceMappingURL=ActionMenuRecord.js.map