"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importExpress = importExpress;
function importExpress() {
    try {
        // NOTE: 'express' is added as a peer-dependency, and is required when using this module
        // eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
        const express = require('express');
        return express;
    }
    catch (error) {
        throw new Error('Express must be installed as a peer dependency');
    }
}
//# sourceMappingURL=express.js.map