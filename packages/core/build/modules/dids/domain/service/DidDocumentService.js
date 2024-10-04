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
exports.DidDocumentService = void 0;
const class_validator_1 = require("class-validator");
const error_1 = require("../../../../error");
const utils_1 = require("../../../../utils");
const uri_1 = require("../../../../utils/uri");
class DidDocumentService {
    constructor(options) {
        if (options) {
            this.id = options.id;
            this.serviceEndpoint = options.serviceEndpoint;
            this.type = options.type;
        }
    }
    /**
     * @deprecated will be removed in 0.6, as it's not possible from the base did document service class to determine
     * the protocol scheme. It needs to be implemented on a specific did document service class.
     */
    get protocolScheme() {
        if (typeof this.serviceEndpoint !== 'string') {
            throw new error_1.CredoError('Unable to extract protocol scheme from serviceEndpoint as it is not a string.');
        }
        return (0, uri_1.getProtocolScheme)(this.serviceEndpoint);
    }
}
exports.DidDocumentService = DidDocumentService;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DidDocumentService.prototype, "id", void 0);
__decorate([
    IsStringOrJsonObjectSingleOrArray(),
    __metadata("design:type", Object)
], DidDocumentService.prototype, "serviceEndpoint", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DidDocumentService.prototype, "type", void 0);
/**
 * Checks if a given value is a string, a json object, or an array of strings and json objects
 */
function IsStringOrJsonObjectSingleOrArray(validationOptions) {
    return (0, class_validator_1.ValidateBy)({
        name: 'isStringOrJsonObjectSingleOrArray',
        validator: {
            validate: (value) => (0, class_validator_1.isString)(value) ||
                (0, utils_1.isJsonObject)(value) ||
                (Array.isArray(value) && value.every((v) => (0, class_validator_1.isString)(v) || (0, utils_1.isJsonObject)(v))),
            defaultMessage: (0, class_validator_1.buildMessage)((eachPrefix) => eachPrefix + '$property must be a string, JSON object, or an array consisting of strings and JSON objects', validationOptions),
        },
    }, validationOptions);
}
//# sourceMappingURL=DidDocumentService.js.map