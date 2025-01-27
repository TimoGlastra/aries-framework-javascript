"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importSecureEnvironment = importSecureEnvironment;
function importSecureEnvironment() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const secureEnvironment = require('@animo-id/expo-secure-environment');
        return secureEnvironment;
    }
    catch (error) {
        throw new Error('@animo-id/expo-secure-environment must be installed as a peer dependency');
    }
}
//# sourceMappingURL=secureEnvironment.native.js.map