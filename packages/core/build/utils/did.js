"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indyDidFromPublicKeyBase58 = indyDidFromPublicKeyBase58;
exports.isDid = isDid;
const TypedArrayEncoder_1 = require("./TypedArrayEncoder");
function indyDidFromPublicKeyBase58(publicKeyBase58) {
    const buffer = TypedArrayEncoder_1.TypedArrayEncoder.fromBase58(publicKeyBase58);
    const did = TypedArrayEncoder_1.TypedArrayEncoder.toBase58(buffer.slice(0, 16));
    return did;
}
/**
 * Checks whether `potentialDid` is a valid DID. You can optionally provide a `method` to
 * check whether the did is for that specific method.
 *
 * Note: the check in this method is very simple and just check whether the did starts with
 * `did:` or `did:<method>:`. It does not do an advanced regex check on the did.
 */
function isDid(potentialDid, method) {
    return method ? potentialDid.startsWith(`did:${method}:`) : potentialDid.startsWith('did:');
}
//# sourceMappingURL=did.js.map