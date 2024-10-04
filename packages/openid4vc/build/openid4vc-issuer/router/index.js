"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCredentialOfferEndpoint = exports.configureIssuerMetadataEndpoint = exports.configureCredentialEndpoint = exports.configureAccessTokenEndpoint = void 0;
var accessTokenEndpoint_1 = require("./accessTokenEndpoint");
Object.defineProperty(exports, "configureAccessTokenEndpoint", { enumerable: true, get: function () { return accessTokenEndpoint_1.configureAccessTokenEndpoint; } });
var credentialEndpoint_1 = require("./credentialEndpoint");
Object.defineProperty(exports, "configureCredentialEndpoint", { enumerable: true, get: function () { return credentialEndpoint_1.configureCredentialEndpoint; } });
var metadataEndpoint_1 = require("./metadataEndpoint");
Object.defineProperty(exports, "configureIssuerMetadataEndpoint", { enumerable: true, get: function () { return metadataEndpoint_1.configureIssuerMetadataEndpoint; } });
var credentialOfferEndpoint_1 = require("./credentialOfferEndpoint");
Object.defineProperty(exports, "configureCredentialOfferEndpoint", { enumerable: true, get: function () { return credentialOfferEndpoint_1.configureCredentialOfferEndpoint; } });
//# sourceMappingURL=index.js.map