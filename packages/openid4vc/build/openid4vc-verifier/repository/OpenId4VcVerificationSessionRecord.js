"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcVerificationSessionRecord = void 0;
const core_1 = require("@credo-ts/core");
class OpenId4VcVerificationSessionRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c;
        super();
        this.type = OpenId4VcVerificationSessionRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
            this.verifierId = props.verifierId;
            this.state = props.state;
            this.errorMessage = props.errorMessage;
            this.authorizationRequestJwt = props.authorizationRequestJwt;
            this.authorizationRequestUri = props.authorizationRequestUri;
            this.authorizationResponsePayload = props.authorizationResponsePayload;
            this.presentationDuringIssuanceSession = props.presentationDuringIssuanceSession;
        }
    }
    assertState(expectedStates) {
        if (!Array.isArray(expectedStates)) {
            expectedStates = [expectedStates];
        }
        if (!expectedStates.includes(this.state)) {
            throw new core_1.CredoError(`OpenId4VcVerificationSessionRecord is in invalid state ${this.state}. Valid states are: ${expectedStates.join(', ')}.`);
        }
    }
    getTags() {
        const parsedAuthorizationRequest = core_1.Jwt.fromSerializedJwt(this.authorizationRequestJwt);
        const nonce = parsedAuthorizationRequest.payload.additionalClaims.nonce;
        if (!nonce || typeof nonce !== 'string')
            throw new core_1.CredoError('Expected nonce in authorization request payload');
        const payloadState = parsedAuthorizationRequest.payload.additionalClaims.state;
        if (!payloadState || typeof payloadState !== 'string')
            throw new core_1.CredoError('Expected state in authorization request payload');
        return Object.assign(Object.assign({}, this._tags), { verifierId: this.verifierId, state: this.state, nonce,
            // FIXME: how do we call this property so it doesn't conflict with the record state?
            payloadState, authorizationRequestUri: this.authorizationRequestUri });
    }
}
exports.OpenId4VcVerificationSessionRecord = OpenId4VcVerificationSessionRecord;
OpenId4VcVerificationSessionRecord.type = 'OpenId4VcVerificationSessionRecord';
//# sourceMappingURL=OpenId4VcVerificationSessionRecord.js.map