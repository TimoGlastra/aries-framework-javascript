"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToAskarKeyBackend = void 0;
const core_1 = require("@credo-ts/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const convertToAskarKeyBackend = (credoKeyBackend) => {
    switch (credoKeyBackend) {
        case core_1.KeyBackend.Software:
            return aries_askar_shared_1.KeyBackend.Software;
        case core_1.KeyBackend.SecureElement:
            return aries_askar_shared_1.KeyBackend.SecureElement;
    }
};
exports.convertToAskarKeyBackend = convertToAskarKeyBackend;
//# sourceMappingURL=askarKeyBackend.js.map