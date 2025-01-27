import { SingleOrArray } from '../../../../utils';
import { DidDocumentService } from './DidDocumentService';
export interface NewDidCommV2ServiceEndpointOptions {
    uri: string;
    routingKeys?: string[];
    accept?: string[];
}
export declare class NewDidCommV2ServiceEndpoint {
    constructor(options: NewDidCommV2ServiceEndpointOptions);
    uri: string;
    routingKeys?: string[];
    accept?: string[];
    [key: string]: unknown | undefined;
}
export interface DidCommV2ServiceOptions {
    id: string;
    serviceEndpoint: SingleOrArray<NewDidCommV2ServiceEndpoint>;
}
/**
 * Will be renamed to `DidCommV2Service` in 0.6 (and replace the current `DidCommV2Service`)
 */
export declare class NewDidCommV2Service extends DidDocumentService {
    constructor(options: DidCommV2ServiceOptions);
    static type: string;
    serviceEndpoint: SingleOrArray<NewDidCommV2ServiceEndpoint>;
    get firstServiceEndpointUri(): string;
}
