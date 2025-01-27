"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNativeDocumentLoader = getNativeDocumentLoader;
function getNativeDocumentLoader() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loader = require('@digitalcredentials/jsonld/lib/documentLoaders/xhr');
    return loader;
}
//# sourceMappingURL=nativeDocumentLoader.native.js.map