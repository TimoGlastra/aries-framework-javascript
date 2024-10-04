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
exports.ActionMenuFormParameter = exports.ActionMenuFormInputType = void 0;
const class_validator_1 = require("class-validator");
/**
 * @public
 */
var ActionMenuFormInputType;
(function (ActionMenuFormInputType) {
    ActionMenuFormInputType["Text"] = "text";
})(ActionMenuFormInputType || (exports.ActionMenuFormInputType = ActionMenuFormInputType = {}));
/**
 * @public
 */
class ActionMenuFormParameter {
    constructor(options) {
        if (options) {
            this.name = options.name;
            this.title = options.title;
            this.default = options.default;
            this.description = options.description;
            this.required = options.required;
            this.type = options.type;
        }
    }
}
exports.ActionMenuFormParameter = ActionMenuFormParameter;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActionMenuFormParameter.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActionMenuFormParameter.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ActionMenuFormParameter.prototype, "default", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActionMenuFormParameter.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ActionMenuFormParameter.prototype, "required", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ActionMenuFormInputType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ActionMenuFormParameter.prototype, "type", void 0);
//# sourceMappingURL=ActionMenuOptionFormParameter.js.map