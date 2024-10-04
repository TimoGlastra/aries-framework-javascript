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
exports.ActionMenuSelection = void 0;
const class_validator_1 = require("class-validator");
/**
 * @public
 */
class ActionMenuSelection {
    constructor(options) {
        if (options) {
            this.name = options.name;
            this.params = options.params;
        }
    }
}
exports.ActionMenuSelection = ActionMenuSelection;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActionMenuSelection.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ActionMenuSelection.prototype, "params", void 0);
//# sourceMappingURL=ActionMenuSelection.js.map