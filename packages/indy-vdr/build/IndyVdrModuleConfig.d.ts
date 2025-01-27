import type { IndyVdrPoolConfig } from './pool';
import type { IndyVdr } from '@hyperledger/indy-vdr-shared';
export interface IndyVdrModuleConfigOptions {
    /**
     *
     * ## Node.JS
     *
     * ```ts
     * import { indyVdr } from '@hyperledger/indy-vdr-nodejs';
     *
     * const agent = new Agent({
     *  config: {},
     *  dependencies: agentDependencies,
     *  modules: {
     *   indyVdr: new IndyVdrModule({
     *      indyVdr,
     *   })
     *  }
     * })
     * ```
     *
     * ## React Native
     *
     * ```ts
     * import { indyVdr } from '@hyperledger/indy-vdr-react-native';
     *
     * const agent = new Agent({
     *  config: {},
     *  dependencies: agentDependencies,
     *  modules: {
     *   indyVdr: new IndyVdrModule({
     *      indyVdr,
     *   })
     *  }
     * })
     * ```
     */
    indyVdr: IndyVdr;
    /**
     * Array of indy networks to connect to.
     *
     * @default []
     *
     * @example
     * ```
     * {
     *   isProduction: false,
     *   genesisTransactions: 'xxx',
     *   indyNamespace: 'localhost:test',
     *   transactionAuthorAgreement: {
     *     version: '1',
     *     acceptanceMechanism: 'accept'
     *   }
     * }
     * ```
     */
    networks: [IndyVdrPoolConfig, ...IndyVdrPoolConfig[]];
}
export declare class IndyVdrModuleConfig {
    private options;
    constructor(options: IndyVdrModuleConfigOptions);
    /** See {@link IndyVdrModuleConfigOptions.networks} */
    get networks(): [IndyVdrPoolConfig, ...IndyVdrPoolConfig[]];
    /** See {@link IndyVdrModuleConfigOptions.indyVdr} */
    get indyVdr(): IndyVdr;
}
