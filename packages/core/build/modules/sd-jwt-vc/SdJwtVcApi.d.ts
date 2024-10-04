import type { SdJwtVcSignOptions, SdJwtVcHeader, SdJwtVcPayload, SdJwtVcPresentOptions, SdJwtVcVerifyOptions } from './SdJwtVcOptions';
import type { SdJwtVcRecord } from './repository';
import type { Query, QueryOptions } from '../../storage/StorageService';
import { AgentContext } from '../../agent';
import { SdJwtVcService } from './SdJwtVcService';
/**
 * @public
 */
export declare class SdJwtVcApi {
    private agentContext;
    private sdJwtVcService;
    constructor(agentContext: AgentContext, sdJwtVcService: SdJwtVcService);
    sign<Payload extends SdJwtVcPayload>(options: SdJwtVcSignOptions<Payload>): Promise<{
        compact: string;
        prettyClaims: Payload;
        header: {
            readonly alg: import("../..").JwaSignatureAlgorithm;
            readonly typ: "vc+sd-jwt";
            readonly kid: string | undefined;
            readonly x5c: string[] | undefined;
        };
        payload: Payload;
    }>;
    /**
     *
     * Create a compact presentation of the sd-jwt.
     * This presentation can be send in- or out-of-band to the verifier.
     *
     * Also, whether to include the holder key binding.
     */
    present<Payload extends SdJwtVcPayload = SdJwtVcPayload>(options: SdJwtVcPresentOptions<Payload>): Promise<string>;
    /**
     *
     * Verify an incoming sd-jwt. It will check whether everything is valid, but also returns parts of the validation.
     *
     * For example, you might still want to continue with a flow if not all the claims are included, but the signature is valid.
     *
     */
    verify<Header extends SdJwtVcHeader, Payload extends SdJwtVcPayload>(options: SdJwtVcVerifyOptions): Promise<{
        isValid: true;
        verification: import("./SdJwtVcService").VerificationResult;
        sdJwtVc: import("./SdJwtVcService").SdJwtVc<Header, Payload>;
    } | {
        isValid: false;
        verification: import("./SdJwtVcService").VerificationResult;
        sdJwtVc?: import("./SdJwtVcService").SdJwtVc<Header, Payload> | undefined;
        error: Error;
    }>;
    /**
     * Get and validate a sd-jwt-vc from a serialized JWT.
     */
    fromCompact<Header extends SdJwtVcHeader, Payload extends SdJwtVcPayload>(sdJwtVcCompact: string): import("./SdJwtVcService").SdJwtVc<Header, Payload>;
    store(compactSdJwtVc: string): Promise<SdJwtVcRecord>;
    getById(id: string): Promise<SdJwtVcRecord>;
    getAll(): Promise<Array<SdJwtVcRecord>>;
    findAllByQuery(query: Query<SdJwtVcRecord>, queryOptions?: QueryOptions): Promise<Array<SdJwtVcRecord>>;
    deleteById(id: string): Promise<void>;
    update(sdJwtVcRecord: SdJwtVcRecord): Promise<void>;
}
