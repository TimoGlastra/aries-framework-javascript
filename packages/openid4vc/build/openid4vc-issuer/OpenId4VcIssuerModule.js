"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcIssuerModule = void 0;
const oauth2_1 = require("@animo-id/oauth2");
const core_1 = require("@credo-ts/core");
const router_1 = require("../shared/router");
const OpenId4VcIssuerApi_1 = require("./OpenId4VcIssuerApi");
const OpenId4VcIssuerModuleConfig_1 = require("./OpenId4VcIssuerModuleConfig");
const OpenId4VcIssuerService_1 = require("./OpenId4VcIssuerService");
const repository_1 = require("./repository");
const OpenId4VcIssuerRepository_1 = require("./repository/OpenId4VcIssuerRepository");
const router_2 = require("./router");
const federationEndpoint_1 = require("./router/federationEndpoint");
/**
 * @public
 */
class OpenId4VcIssuerModule {
    constructor(options) {
        this.api = OpenId4VcIssuerApi_1.OpenId4VcIssuerApi;
        this.config = new OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig(options);
    }
    /**
     * Registers the dependencies of the openid4vc issuer module on the dependency manager.
     */
    register(dependencyManager) {
        const agentConfig = dependencyManager.resolve(core_1.AgentConfig);
        // Warn about experimental module
        agentConfig.logger.warn("The '@credo-ts/openid4vc' Issuer module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @credo-ts packages.");
        if (agentConfig.allowInsecureHttpUrls) {
            (0, oauth2_1.setGlobalConfig)({
                allowInsecureUrls: true,
            });
        }
        // Register config
        dependencyManager.registerInstance(OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig, this.config);
        // Services
        dependencyManager.registerSingleton(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
        // Repository
        dependencyManager.registerSingleton(OpenId4VcIssuerRepository_1.OpenId4VcIssuerRepository);
        dependencyManager.registerSingleton(repository_1.OpenId4VcIssuanceSessionRepository);
    }
    async initialize(rootAgentContext) {
        this.configureRouter(rootAgentContext);
    }
    /**
     * Registers the endpoints on the router passed to this module.
     */
    configureRouter(rootAgentContext) {
        const { Router, json, urlencoded } = (0, router_1.importExpress)();
        // TODO: it is currently not possible to initialize an agent
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
        contextRouter.param('issuerId', async (req, _res, next, issuerId) => {
            if (!issuerId) {
                rootAgentContext.config.logger.debug('No issuerId provided for incoming oid4vci request, returning 404');
                _res.status(404).send('Not found');
            }
            let agentContext = undefined;
            try {
                // FIXME: should we create combined openId actor record?
                agentContext = await (0, router_1.getAgentContextForActorId)(rootAgentContext, issuerId);
                const issuerApi = agentContext.dependencyManager.resolve(OpenId4VcIssuerApi_1.OpenId4VcIssuerApi);
                const issuer = await issuerApi.getIssuerByIssuerId(issuerId);
                req.requestContext = {
                    agentContext,
                    issuer,
                };
            }
            catch (error) {
                agentContext === null || agentContext === void 0 ? void 0 : agentContext.config.logger.error('Failed to correlate incoming oid4vci request to existing tenant and issuer', {
                    error,
                });
                // If the opening failed
                await (agentContext === null || agentContext === void 0 ? void 0 : agentContext.endSession());
                return _res.status(404).send('Not found');
            }
            next();
        });
        contextRouter.use('/:issuerId', endpointRouter);
        // Configure endpoints
        (0, router_2.configureIssuerMetadataEndpoint)(endpointRouter);
        (0, router_2.configureJwksEndpoint)(endpointRouter, this.config);
        (0, router_2.configureNonceEndpoint)(endpointRouter, this.config);
        (0, router_2.configureOAuthAuthorizationServerMetadataEndpoint)(endpointRouter);
        (0, router_2.configureCredentialOfferEndpoint)(endpointRouter, this.config);
        (0, router_2.configureAccessTokenEndpoint)(endpointRouter, this.config);
        (0, router_2.configureAuthorizationChallengeEndpoint)(endpointRouter, this.config);
        (0, router_2.configureCredentialEndpoint)(endpointRouter, this.config);
        (0, federationEndpoint_1.configureFederationEndpoint)(endpointRouter);
        // First one will be called for all requests (when next is called)
        contextRouter.use(async (req, _res, next) => {
            const { agentContext } = (0, router_1.getRequestContext)(req);
            await agentContext.endSession();
            next();
        });
        // This one will be called for all errors that are thrown
        contextRouter.use(async (_error, req, res, next) => {
            const { agentContext } = (0, router_1.getRequestContext)(req);
            if (!res.headersSent) {
                agentContext.config.logger.warn('Error was thrown but openid4vci endpoint did not send a response. Sending generic server_error.');
                res.status(500).json({
                    error: 'server_error',
                    error_description: 'An unexpected error occurred on the server.',
                });
            }
            await agentContext.endSession();
            next();
        });
    }
}
exports.OpenId4VcIssuerModule = OpenId4VcIssuerModule;
//# sourceMappingURL=OpenId4VcIssuerModule.js.map