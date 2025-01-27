"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceTypes = void 0;
exports.ServiceTransformer = ServiceTransformer;
const class_transformer_1 = require("class-transformer");
const utils_1 = require("../../../../utils");
const DidCommV1Service_1 = require("./DidCommV1Service");
const DidCommV2Service_1 = require("./DidCommV2Service");
const DidDocumentService_1 = require("./DidDocumentService");
const IndyAgentService_1 = require("./IndyAgentService");
const NewDidCommV2Service_1 = require("./NewDidCommV2Service");
exports.serviceTypes = {
    [IndyAgentService_1.IndyAgentService.type]: IndyAgentService_1.IndyAgentService,
    [DidCommV1Service_1.DidCommV1Service.type]: DidCommV1Service_1.DidCommV1Service,
    [NewDidCommV2Service_1.NewDidCommV2Service.type]: NewDidCommV2Service_1.NewDidCommV2Service,
    [DidCommV2Service_1.DidCommV2Service.type]: DidCommV2Service_1.DidCommV2Service,
};
/**
 * Decorator that transforms service json to corresponding class instances. See {@link serviceTypes}
 *
 * @example
 * class Example {
 *   ServiceTransformer()
 *   private service: Service
 * }
 */
function ServiceTransformer() {
    return (0, class_transformer_1.Transform)(({ value }) => {
        return value === null || value === void 0 ? void 0 : value.map((serviceJson) => {
            var _a;
            let serviceClass = ((_a = exports.serviceTypes[serviceJson.type]) !== null && _a !== void 0 ? _a : DidDocumentService_1.DidDocumentService);
            // NOTE: deal with `DIDCommMessaging` type but using `serviceEndpoint` string value, parse it using the
            // legacy class type
            if (serviceJson.type === NewDidCommV2Service_1.NewDidCommV2Service.type &&
                'serviceEndpoint' in serviceJson &&
                typeof serviceJson.serviceEndpoint === 'string') {
                serviceClass = DidCommV2Service_1.DidCommV2Service;
            }
            const service = utils_1.JsonTransformer.fromJSON(serviceJson, serviceClass);
            return service;
        });
    }, {
        toClassOnly: true,
    });
}
//# sourceMappingURL=ServiceTransformer.js.map