export interface OpenId4VciAuthorizationServerConfig {
    issuer: string;
    /**
     * Optional client authentication for token introspection
     */
    clientAuthentication?: {
        clientId: string;
        clientSecret: string;
    };
}
