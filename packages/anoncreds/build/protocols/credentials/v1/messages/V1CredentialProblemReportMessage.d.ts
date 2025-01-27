import type { ProblemReportMessageOptions } from '@credo-ts/core';
import { ProblemReportMessage } from '@credo-ts/core';
export type V1CredentialProblemReportMessageOptions = ProblemReportMessageOptions;
/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0035-report-problem/README.md
 */
export declare class V1CredentialProblemReportMessage extends ProblemReportMessage {
    readonly allowDidSovPrefix = true;
    /**
     * Create new CredentialProblemReportMessage instance.
     * @param options
     */
    constructor(options: V1CredentialProblemReportMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
}
