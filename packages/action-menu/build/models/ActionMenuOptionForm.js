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
exports.ActionMenuForm = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const ActionMenuOptionFormParameter_1 = require("./ActionMenuOptionFormParameter");
/**
 * @public
 */
class ActionMenuForm {
    constructor(options) {
        if (options) {
            this.description = options.description;
            this.params = options.params.map((p) => new ActionMenuOptionFormParameter_1.ActionMenuFormParameter(p));
            this.submitLabel = options.submitLabel;
        }
    }
}
exports.ActionMenuForm = ActionMenuForm;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActionMenuForm.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'submit-label' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActionMenuForm.prototype, "submitLabel", void 0);
__decorate([
    (0, class_validator_1.IsInstance)(ActionMenuOptionFormParameter_1.ActionMenuFormParameter, { each: true }),
    (0, class_transformer_1.Type)(() => ActionMenuOptionFormParameter_1.ActionMenuFormParameter),
    __metadata("design:type", Array)
], ActionMenuForm.prototype, "params", void 0);
//# sourceMappingURL=ActionMenuOptionForm.js.map