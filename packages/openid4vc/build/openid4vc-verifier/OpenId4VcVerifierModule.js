"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcVerifierModule = void 0;
const core_1 = require("@credo-ts/core");
const router_1 = require("../shared/router");
const OpenId4VcSiopVerifierService_1 = require("./OpenId4VcSiopVerifierService");
const OpenId4VcVerifierApi_1 = require("./OpenId4VcVerifierApi");
const OpenId4VcVerifierModuleConfig_1 = require("./OpenId4VcVerifierModuleConfig");
const repository_1 = require("./repository");
const OpenId4VcRelyingPartyEventEmitter_1 = require("./repository/OpenId4VcRelyingPartyEventEmitter");
const router_2 = require("./router");
const authorizationRequestEndpoint_1 = require("./router/authorizationRequestEndpoint");
/**
 * @public
 */
class OpenId4VcVerifierModule {
    constructor(options) {
        this.api = OpenId4VcVerifierApi_1.OpenId4VcVerifierApi;
        this.config = new OpenId4VcVerifierModuleConfig_1.OpenId4VcVerifierModuleConfig(options);
    }
    /**
     * Registers the dependencies of the question answer module on the dependency manager.
     */
    register(dependencyManager) {
        // Warn about experimental module
        const logger = dependencyManager.resolve(core_1.AgentConfig).logger;
        logger.warn("The '@credo-ts/openid4vc' Verifier module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @credo-ts packages.");
        // Register config
        dependencyManager.registerInstance(OpenId4VcVerifierModuleConfig_1.OpenId4VcVerifierModuleConfig, this.config);
        // Services
        dependencyManager.registerSingleton(OpenId4VcSiopVerifierService_1.OpenId4VcSiopVerifierService);
        // Repository
        dependencyManager.registerSingleton(repository_1.OpenId4VcVerifierRepository);
        // Global event emitter
        dependencyManager.registerSingleton(OpenId4VcRelyingPartyEventEmitter_1.OpenId4VcRelyingPartyEventHandler);
    }
    async initialize(rootAgentContext) {
        this.configureRouter(rootAgentContext);
    }
    /**
     * Registers the endpoints on the router passed to this module.
     */
    configureRouter(rootAgentContext) {
        const { Router, json, urlencoded } = (0, router_1.importExpress)();
        // FIXME: it is currently not possible to initialize an agent
        // shut it down, and then start it again, as the
        // express router is configured with a specific `AgentContext` instance
        // and dependency manager. One option is to always create a new router
        // but then users cannot pass their own router implementation.
        // We need to find a proper way to fix this.
        // We use separate context router and endpoint router. Context router handles the linking of the request
        // to a specific agent context. Endpoint router only knows about a single context
        const endpointRouter = Router();
        const contextRouter = this.config.router;
        // parse application/x-www-form-urlencoded
        contextRouter.use(urlencoded({ extended: false }));
        // parse application/json
        contextRouter.use(json());
        contextRouter.param('verifierId', async (req, _res, next, verifierId) => {
            if (!verifierId) {
                rootAgentContext.config.logger.debug('No verifierId provided for incoming authorization response, returning 404');
                _res.status(404).send('Not found');
            }
            let agentContext = undefined;
            try {
                agentContext = await (0, router_1.getAgentContextForActorId)(rootAgentContext, verifierId);
                const verifierApi = agentContext.dependencyManager.resolve(OpenId4VcVerifierApi_1.OpenId4VcVerifierApi);
                const verifier = await verifierApi.getVerifierByVerifierId(verifierId);
                req.requestContext = {
                    agentContext,
                    verifier,
                };
            }
            catch (error) {
                agentContext === null || agentContext === void 0 ? void 0 : agentContext.config.logger.error('Failed to correlate incoming openid request to existing tenant and verifier', {
                    error,
                });
                // If the opening failed
                await (agentContext === null || agentContext === void 0 ? void 0 : agentContext.endSession());
                return _res.status(404).send('Not found');
            }
            next();
        });
        contextRouter.use('/:verifierId', endpointRouter);
        // Configure endpoints
        (0, router_2.configureAuthorizationEndpoint)(endpointRouter, this.config.authorizationEndpoint);
        (0, authorizationRequestEndpoint_1.configureAuthorizationRequestEndpoint)(endpointRouter, this.config.authorizationRequestEndpoint);
        // First one will be called for all requests (when next is called)
        contextRouter.use(async (req, _res, next) => {
            const { agentContext } = (0, router_1.getRequestContext)(req);
            await agentContext.endSession();
            next();
        });
        // This one will be called for all errors that are thrown
        contextRouter.use(async (_error, req, _res, next) => {
            const { agentContext } = (0, router_1.getRequestContext)(req);
            await agentContext.endSession();
            next();
        });
    }
}
exports.OpenId4VcVerifierModule = OpenId4VcVerifierModule;
//# sourceMappingURL=OpenId4VcVerifierModule.js.map