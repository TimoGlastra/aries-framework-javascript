import type { OpenId4VciCredentialConfigurationsSupported, OpenId4VciCredentialConfigurationsSupportedWithFormats } from './models';
import { type CredentialConfigurationsSupported } from '@animo-id/oid4vci';
/**
 * Returns all entries from the credential offer with the associated metadata resolved.
 */
export declare function getOfferedCredentials<Configurations extends OpenId4VciCredentialConfigurationsSupported | OpenId4VciCredentialConfigurationsSupportedWithFormats>(offeredCredentialConfigurationIds: Array<string>, credentialConfigurationsSupported: Configurations, { ignoreNotFoundIds }?: {
    ignoreNotFoundIds?: boolean;
}): Configurations extends OpenId4VciCredentialConfigurationsSupportedWithFormats ? OpenId4VciCredentialConfigurationsSupportedWithFormats : OpenId4VciCredentialConfigurationsSupported;
export declare function getScopesFromCredentialConfigurationsSupported(credentialConfigurationsSupported: CredentialConfigurationsSupported): string[];
export declare function getAllowedAndRequestedScopeValues(options: {
    requestedScope: string;
    allowedScopes: string[];
}): string[];
export declare function getCredentialConfigurationsSupportedForScopes(credentialConfigurationsSupported: CredentialConfigurationsSupported, scopes: string[]): {
    [k: string]: ({
        format: "vc+sd-jwt";
        vct: string;
        claims?: ({
            mandatory?: boolean | undefined;
            value_type?: string | undefined;
            display?: ({
                name?: string | undefined;
                locale?: string | undefined;
            } & {
                [key: string]: unknown;
            }) | undefined;
        } & {
            [key: string]: unknown;
        }) | undefined;
        order?: string[] | undefined;
    } | {
        format: "mso_mdoc";
        doctype: string;
        claims?: ({
            mandatory?: boolean | undefined;
            value_type?: string | undefined;
            display?: ({
                name?: string | undefined;
                locale?: string | undefined;
            } & {
                [key: string]: unknown;
            }) | undefined;
        } & {
            [key: string]: unknown;
        }) | undefined;
        order?: string[] | undefined;
    } | {
        format: "jwt_vc_json-ld";
        credential_definition: {
            type: string[];
            '@context': string[];
            credentialSubject?: {
                [x: string]: any[] | {
                    [x: string]: any;
                } | ({
                    mandatory: boolean;
                    value_type?: string | undefined;
                    display?: ({
                        name?: string | undefined;
                        locale?: string | undefined;
                    } & {
                        [key: string]: unknown;
                    })[] | undefined;
                } & {
                    [key: string]: unknown;
                });
            } | undefined;
        } & {
            [key: string]: unknown;
        };
        order?: string[] | undefined;
    } | {
        format: "ldp_vc";
        credential_definition: {
            type: string[];
            '@context': string[];
            credentialSubject?: {
                [x: string]: any[] | {
                    [x: string]: any;
                } | ({
                    mandatory: boolean;
                    value_type?: string | undefined;
                    display?: ({
                        name?: string | undefined;
                        locale?: string | undefined;
                    } & {
                        [key: string]: unknown;
                    })[] | undefined;
                } & {
                    [key: string]: unknown;
                });
            } | undefined;
        } & {
            [key: string]: unknown;
        };
        order?: string[] | undefined;
    } | {
        format: "jwt_vc_json";
        credential_definition: {
            type: string[];
            credentialSubject?: {
                [x: string]: any[] | {
                    [x: string]: any;
                } | ({
                    mandatory: boolean;
                    value_type?: string | undefined;
                    display?: ({
                        name?: string | undefined;
                        locale?: string | undefined;
                    } & {
                        [key: string]: unknown;
                    })[] | undefined;
                } & {
                    [key: string]: unknown;
                });
            } | undefined;
        } & {
            [key: string]: unknown;
        };
        order?: string[] | undefined;
    } | ({
        format: string;
    } & {
        [key: string]: unknown;
    })) & {
        format: string;
        display?: ({
            name: string;
            description?: string | undefined;
            locale?: string | undefined;
            logo?: ({
                uri?: string | undefined;
                alt_text?: string | undefined;
            } & {
                [key: string]: unknown;
            }) | undefined;
            background_color?: string | undefined;
            background_image?: ({
                uri?: string | undefined;
            } & {
                [key: string]: unknown;
            }) | undefined;
            text_color?: string | undefined;
        } & {
            [key: string]: unknown;
        })[] | undefined;
        scope?: string | undefined;
        cryptographic_binding_methods_supported?: string[] | undefined;
        credential_signing_alg_values_supported?: string[] | undefined;
        proof_types_supported?: {
            [x: string]: {
                proof_signing_alg_values_supported: string[];
            };
        } | undefined;
    } & {
        [key: string]: unknown;
    };
};
