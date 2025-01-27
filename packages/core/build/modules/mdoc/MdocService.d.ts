import type { MdocSignOptions, MdocPexDeviceResponseOpenId4VpOptions, MdocDeviceResponseVerifyOptions, MdocVerifyOptions, MdocDeviceResponseOptions } from './MdocOptions';
import type { Query, QueryOptions } from '../../storage/StorageService';
import { AgentContext } from '../../agent';
import { Mdoc } from './Mdoc';
import { MdocRecord, MdocRepository } from './repository';
/**
 * @internal
 */
export declare class MdocService {
    private MdocRepository;
    constructor(mdocRepository: MdocRepository);
    mdocFromBase64Url(hexEncodedMdoc: string): Mdoc;
    signMdoc(agentContext: AgentContext, options: MdocSignOptions): Promise<Mdoc>;
    verifyMdoc(agentContext: AgentContext, mdoc: Mdoc, options: MdocVerifyOptions): Promise<{
        isValid: true;
    } | {
        isValid: false;
        error: string;
    }>;
    createDeviceResponse(agentContext: AgentContext, options: MdocDeviceResponseOptions): Promise<{
        deviceResponseBase64Url: string;
    }>;
    createOpenId4VpDeviceResponse(agentContext: AgentContext, options: MdocPexDeviceResponseOpenId4VpOptions): Promise<{
        deviceResponseBase64Url: string;
        presentationSubmission: {
            id: string;
            definition_id: string;
            descriptor_map: {
                id: string;
                format: string;
                path: string;
            }[];
        };
    }>;
    verifyDeviceResponse(agentContext: AgentContext, options: MdocDeviceResponseVerifyOptions): Promise<Mdoc[]>;
    store(agentContext: AgentContext, mdoc: Mdoc): Promise<MdocRecord>;
    getById(agentContext: AgentContext, id: string): Promise<MdocRecord>;
    getAll(agentContext: AgentContext): Promise<Array<MdocRecord>>;
    findByQuery(agentContext: AgentContext, query: Query<MdocRecord>, queryOptions?: QueryOptions): Promise<Array<MdocRecord>>;
    deleteById(agentContext: AgentContext, id: string): Promise<void>;
    update(agentContext: AgentContext, mdocRecord: MdocRecord): Promise<void>;
}
