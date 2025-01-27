import type { MdocSignOptions, MdocVerifyOptions } from './MdocOptions';
import type { MdocRecord } from './repository';
import type { Query, QueryOptions } from '../../storage/StorageService';
import { AgentContext } from '../../agent';
import { Mdoc } from './Mdoc';
import { MdocService } from './MdocService';
/**
 * @public
 */
export declare class MdocApi {
    private agentContext;
    private mdocService;
    constructor(agentContext: AgentContext, mdocService: MdocService);
    /**
     * Create a new Mdoc, with a spcific doctype, namespace, and validity info.
     *
     * @param options {MdocSignOptions}
     * @returns {Promise<Mdoc>}
     */
    sign(options: MdocSignOptions): Promise<Mdoc>;
    /**
     *
     * Verify an incoming mdoc. It will check whether everything is valid, but also returns parts of the validation.
     *
     * For example, you might still want to continue with a flow if not all the claims are included, but the signature is valid.
     *
     */
    verify(mdoc: Mdoc, options: MdocVerifyOptions): Promise<{
        isValid: true;
    } | {
        isValid: false;
        error: string;
    }>;
    /**
     * Create a Mdoc class from a base64url encoded Mdoc Issuer-Signed structure
     */
    fromBase64Url(base64Url: string): Mdoc;
    store(issuerSigned: Mdoc): Promise<MdocRecord>;
    getById(id: string): Promise<MdocRecord>;
    getAll(): Promise<Array<MdocRecord>>;
    findAllByQuery(query: Query<MdocRecord>, queryOptions?: QueryOptions): Promise<Array<MdocRecord>>;
    deleteById(id: string): Promise<void>;
    update(mdocRecord: MdocRecord): Promise<void>;
}
