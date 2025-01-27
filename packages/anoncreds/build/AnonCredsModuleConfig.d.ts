import type { AnonCredsRegistry } from './services';
import type { TailsFileService } from './services/tails';
import type { Anoncreds } from '@hyperledger/anoncreds-shared';
/**
 * @public
 * AnonCredsModuleConfigOptions defines the interface for the options of the AnonCredsModuleConfig class.
 */
export interface AnonCredsModuleConfigOptions {
    /**
     * A list of AnonCreds registries to make available to the AnonCreds module.
     */
    registries: [AnonCredsRegistry, ...AnonCredsRegistry[]];
    /**
     * Tails file service for download/uploading tails files
     * @default BasicTailsFileService (only for downloading tails files)
     */
    tailsFileService?: TailsFileService;
    /**
     *
     * ## Node.JS
     *
     * ```ts
     * import { anoncreds } from '@hyperledger/anoncreds-nodejs'
     *
     * const agent = new Agent({
     *  config: {},
     *  dependencies: agentDependencies,
     *  modules: {
     *   anoncreds: new AnoncredsModule({
     *      anoncreds,
     *   })
     *  }
     * })
     * ```
     *
     * ## React Native
     *
     * ```ts
     * import { anoncreds } from '@hyperledger/anoncreds-react-native'
     *
     * const agent = new Agent({
     *  config: {},
     *  dependencies: agentDependencies,
     *  modules: {
     *   anoncreds: new AnoncredsModule({
     *      anoncreds,
     *   })
     *  }
     * })
     * ```
     */
    anoncreds: Anoncreds;
    /**
     * Create a default link secret if there are no created link secrets.
     * @defaultValue true
     */
    autoCreateLinkSecret?: boolean;
}
/**
 * @public
 */
export declare class AnonCredsModuleConfig {
    private options;
    constructor(options: AnonCredsModuleConfigOptions);
    /** See {@link AnonCredsModuleConfigOptions.registries} */
    get registries(): [AnonCredsRegistry, ...AnonCredsRegistry[]];
    /** See {@link AnonCredsModuleConfigOptions.tailsFileService} */
    get tailsFileService(): TailsFileService;
    get anoncreds(): Anoncreds;
    /** See {@link AnonCredsModuleConfigOptions.autoCreateLinkSecret} */
    get autoCreateLinkSecret(): boolean;
}
