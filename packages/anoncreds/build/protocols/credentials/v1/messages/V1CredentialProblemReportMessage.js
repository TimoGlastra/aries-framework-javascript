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
exports.V1CredentialProblemReportMessage = void 0;
const core_1 = require("@credo-ts/core");
/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0035-report-problem/README.md
 */
class V1CredentialProblemReportMessage extends core_1.ProblemReportMessage {
    /**
     * Create new CredentialProblemReportMessage instance.
     * @param options
     */
    constructor(options) {
        super(options);
        this.allowDidSovPrefix = true;
        this.type = V1CredentialProblemReportMessage.type.messageTypeUri;
    }
}
exports.V1CredentialProblemReportMessage = V1CredentialProblemReportMessage;
V1CredentialProblemReportMessage.type = (0, core_1.parseMessageType)('https://didcomm.org/issue-credential/1.0/problem-report');
__decorate([
    (0, core_1.IsValidMessageType)(V1CredentialProblemReportMessage.type),
    __metadata("design:type", Object)
], V1CredentialProblemReportMessage.prototype, "type", void 0);
//# sourceMappingURL=V1CredentialProblemReportMessage.js.map