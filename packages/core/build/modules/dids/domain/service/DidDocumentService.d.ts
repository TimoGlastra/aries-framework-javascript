import { SingleOrArray } from '../../../../utils';
type ServiceEndpointType = SingleOrArray<string | Record<string, unknown>>;
export declare class DidDocumentService {
    constructor(options: {
        id: string;
        serviceEndpoint: ServiceEndpointType;
        type: string;
    });
    /**
     * @deprecated will be removed in 0.6, as it's not possible from the base did document service class to determine
     * the protocol scheme. It needs to be implemented on a specific did document service class.
     */
    get protocolScheme(): string;
    id: string;
    serviceEndpoint: SingleOrArray<string | Record<string, unknown>>;
    type: string;
}
export {};
