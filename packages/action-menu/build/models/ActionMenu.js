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
exports.ActionMenu = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const ActionMenuOption_1 = require("./ActionMenuOption");
/**
 * @public
 */
class ActionMenu {
    constructor(options) {
        if (options) {
            this.title = options.title;
            this.description = options.description;
            this.options = options.options.map((p) => new ActionMenuOption_1.ActionMenuOption(p));
        }
    }
}
exports.ActionMenu = ActionMenu;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActionMenu.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActionMenu.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsInstance)(ActionMenuOption_1.ActionMenuOption, { each: true }),
    (0, class_transformer_1.Type)(() => ActionMenuOption_1.ActionMenuOption),
    __metadata("design:type", Array)
], ActionMenu.prototype, "options", void 0);
//# sourceMappingURL=ActionMenu.js.map