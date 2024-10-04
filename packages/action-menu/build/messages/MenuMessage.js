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
exports.MenuMessage = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const models_1 = require("../models");
/**
 * @internal
 */
class MenuMessage extends core_1.AgentMessage {
    constructor(options) {
        var _a;
        super();
        this.type = MenuMessage.type.messageTypeUri;
        if (options) {
            this.id = (_a = options.id) !== null && _a !== void 0 ? _a : this.generateId();
            this.title = options.title;
            this.description = options.description;
            this.errorMessage = options.errorMessage;
            this.options = options.options.map((p) => new models_1.ActionMenuOption(p));
            if (options.threadId) {
                this.setThread({
                    threadId: options.threadId,
                });
            }
        }
    }
}
exports.MenuMessage = MenuMessage;
MenuMessage.type = (0, core_1.parseMessageType)('https://didcomm.org/action-menu/1.0/menu');
__decorate([
    (0, core_1.IsValidMessageType)(MenuMessage.type),
    __metadata("design:type", Object)
], MenuMessage.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MenuMessage.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MenuMessage.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'errormsg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MenuMessage.prototype, "errorMessage", void 0);
__decorate([
    (0, class_validator_1.IsInstance)(models_1.ActionMenuOption, { each: true }),
    (0, class_transformer_1.Type)(() => models_1.ActionMenuOption),
    __metadata("design:type", Array)
], MenuMessage.prototype, "options", void 0);
//# sourceMappingURL=MenuMessage.js.map