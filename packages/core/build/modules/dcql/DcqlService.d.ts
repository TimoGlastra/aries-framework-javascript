import type { AgentContext } from '../../agent';
import { DcqlQuery } from 'dcql';
import { MdocOpenId4VpSessionTranscriptOptions } from '../mdoc';
import { DcqlQueryResult, DcqlCredentialsForRequest, DcqlPresentation as DcqlPresentation, DcqlEncodedPresentations } from './models';
/**
 * @todo create a public api for using dif presentation exchange
 */
export declare class DcqlService {
    /**
     * Queries the wallet for credentials that match the given presentation definition. This only does an initial query based on the
     * schema of the input descriptors. It does not do any further filtering based on the constraints in the input descriptors.
     */
    private queryCredentialsForDcqlQuery;
    getCredentialsForRequest(agentContext: AgentContext, dcqlQuery: DcqlQuery.Input): Promise<DcqlQueryResult>;
    /**
     * Selects the credentials to use based on the output from `getCredentialsForRequest`
     * Use this method if you don't want to manually select the credentials yourself.
     */
    selectCredentialsForRequest(dcqlQueryResult: DcqlQueryResult): DcqlCredentialsForRequest;
    validateDcqlQuery(dcqlQuery: DcqlQuery.Input | DcqlQuery): {
        credentials: [{
            id: string;
            format: "mso_mdoc";
            claims?: [{
                namespace: string;
                claim_name: string;
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }, ...{
                namespace: string;
                claim_name: string;
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }[]] | undefined;
            claim_sets?: [string[], ...string[][]] | undefined;
            meta?: {
                doctype_value?: string | undefined;
            } | undefined;
        } | {
            id: string;
            format: "vc+sd-jwt";
            claims?: [{
                path: (string | number | null)[];
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }, ...{
                path: (string | number | null)[];
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }[]] | undefined;
            claim_sets?: [string[], ...string[][]] | undefined;
            meta?: {
                vct_values?: string[] | undefined;
            } | undefined;
        } | {
            id: string;
            format: "jwt_vc_json-ld" | "jwt_vc_json";
            claims?: [{
                path: (string | number | null)[];
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }, ...{
                path: (string | number | null)[];
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }[]] | undefined;
            claim_sets?: [string[], ...string[][]] | undefined;
        }, ...({
            id: string;
            format: "mso_mdoc";
            claims?: [{
                namespace: string;
                claim_name: string;
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }, ...{
                namespace: string;
                claim_name: string;
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }[]] | undefined;
            claim_sets?: [string[], ...string[][]] | undefined;
            meta?: {
                doctype_value?: string | undefined;
            } | undefined;
        } | {
            id: string;
            format: "vc+sd-jwt";
            claims?: [{
                path: (string | number | null)[];
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }, ...{
                path: (string | number | null)[];
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }[]] | undefined;
            claim_sets?: [string[], ...string[][]] | undefined;
            meta?: {
                vct_values?: string[] | undefined;
            } | undefined;
        } | {
            id: string;
            format: "jwt_vc_json-ld" | "jwt_vc_json";
            claims?: [{
                path: (string | number | null)[];
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }, ...{
                path: (string | number | null)[];
                values?: (string | number | boolean)[] | undefined;
                id?: string | undefined;
            }[]] | undefined;
            claim_sets?: [string[], ...string[][]] | undefined;
        })[]];
        credential_sets?: [{
            options: [string[], ...string[][]];
            required: boolean;
            purpose?: string | number | {
                [x: string]: unknown;
            } | undefined;
        }, ...{
            options: [string[], ...string[][]];
            required: boolean;
            purpose?: string | number | {
                [x: string]: unknown;
            } | undefined;
        }[]] | undefined;
    };
    createPresentation(agentContext: AgentContext, options: {
        credentialQueryToCredential: DcqlCredentialsForRequest;
        challenge: string;
        domain?: string;
        openid4vp?: Omit<MdocOpenId4VpSessionTranscriptOptions, 'verifierGeneratedNonce' | 'clientId'>;
    }): Promise<DcqlPresentation>;
    getEncodedPresentations(dcqlPresentation: DcqlPresentation): DcqlEncodedPresentations;
    private getSdJwtVcApi;
    private getMdocApi;
}
