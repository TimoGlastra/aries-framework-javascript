import { DidDocumentService } from './DidDocumentService';
import { NewDidCommV2Service } from './NewDidCommV2Service';
export interface DidCommV2ServiceOptions {
    id: string;
    serviceEndpoint: string;
    routingKeys?: string[];
    accept?: string[];
}
/**
 * @deprecated use `NewDidCommV2Service` instead. Will be renamed to `LegacyDidCommV2Service` in 0.6
 */
export declare class DidCommV2Service extends DidDocumentService {
    constructor(options: DidCommV2ServiceOptions);
    static type: string;
    routingKeys?: string[];
    accept?: string[];
    serviceEndpoint: string;
    toNewDidCommV2(): NewDidCommV2Service;
}
