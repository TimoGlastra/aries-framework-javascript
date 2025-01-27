/**
 * CheqdModuleConfigOptions defines the interface for the options of the CheqdModuleConfig class.
 */
export interface CheqdModuleConfigOptions {
    networks: NetworkConfig[];
}
export interface NetworkConfig {
    rpcUrl?: string;
    cosmosPayerSeed?: string;
    network: string;
}
export declare class CheqdModuleConfig {
    private options;
    constructor(options: CheqdModuleConfigOptions);
    /** See {@link CheqdModuleConfigOptions.networks} */
    get networks(): NetworkConfig[];
}
