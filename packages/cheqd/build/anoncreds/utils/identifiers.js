"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cheqdResourceMetadataRegex = exports.cheqdResourceRegex = exports.cheqdDidMetadataRegex = exports.cheqdDidVersionsRegex = exports.cheqdDidVersionRegex = exports.cheqdDidRegex = exports.cheqdSdkAnonCredsRegistryIdentifierRegex = void 0;
exports.parseCheqdDid = parseCheqdDid;
const core_1 = require("@credo-ts/core");
const class_validator_1 = require("class-validator");
const ID_CHAR = '([a-z,A-Z,0-9,-])';
const NETWORK = '(testnet|mainnet)';
const IDENTIFIER = `((?:${ID_CHAR}*:)*(${ID_CHAR}+))`;
const PATH = `(/[^#?]*)?`;
const QUERY = `([?][^#]*)?`;
const VERSION_ID = `(.*?)`;
const FRAGMENT = `([#].*)?`;
exports.cheqdSdkAnonCredsRegistryIdentifierRegex = new RegExp(`^did:cheqd:${NETWORK}:${IDENTIFIER}${PATH}${QUERY}${FRAGMENT}$`);
exports.cheqdDidRegex = new RegExp(`^did:cheqd:${NETWORK}:${IDENTIFIER}${QUERY}${FRAGMENT}$`);
exports.cheqdDidVersionRegex = new RegExp(`^did:cheqd:${NETWORK}:${IDENTIFIER}/version/${VERSION_ID}${QUERY}${FRAGMENT}$`);
exports.cheqdDidVersionsRegex = new RegExp(`^did:cheqd:${NETWORK}:${IDENTIFIER}/versions${QUERY}${FRAGMENT}$`);
exports.cheqdDidMetadataRegex = new RegExp(`^did:cheqd:${NETWORK}:${IDENTIFIER}/metadata${QUERY}${FRAGMENT}$`);
exports.cheqdResourceRegex = new RegExp(`^did:cheqd:${NETWORK}:${IDENTIFIER}/resources/${IDENTIFIER}${QUERY}${FRAGMENT}$`);
exports.cheqdResourceMetadataRegex = new RegExp(`^did:cheqd:${NETWORK}:${IDENTIFIER}/resources/${IDENTIFIER}/metadata${QUERY}${FRAGMENT}`);
function parseCheqdDid(didUrl) {
    if (didUrl === '' || !didUrl)
        return null;
    const sections = didUrl.match(exports.cheqdSdkAnonCredsRegistryIdentifierRegex);
    if (sections) {
        if (!(core_1.utils.isValidUuid(sections[2]) ||
            ((0, class_validator_1.isBase58)(sections[2]) && core_1.TypedArrayEncoder.fromBase58(sections[2]).length == 16))) {
            return null;
        }
        const parts = {
            did: `did:cheqd:${sections[1]}:${sections[2]}`,
            method: 'cheqd',
            network: sections[1],
            id: sections[2],
            didUrl,
        };
        if (sections[7]) {
            const params = sections[7].slice(1).split('&');
            parts.params = {};
            for (const p of params) {
                const kv = p.split('=');
                parts.params[kv[0]] = kv[1];
            }
        }
        if (sections[6])
            parts.path = sections[6];
        if (sections[8])
            parts.fragment = sections[8].slice(1);
        return parts;
    }
    return null;
}
//# sourceMappingURL=identifiers.js.map