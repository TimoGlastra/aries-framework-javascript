import type { ProblemReportMessageOptions } from '@credo-ts/core';
import { ProblemReportMessage } from '@credo-ts/core';
export type V1PresentationProblemReportMessageOptions = ProblemReportMessageOptions;
/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0035-report-problem/README.md
 */
export declare class V1PresentationProblemReportMessage extends ProblemReportMessage {
    readonly allowDidSovPrefix = true;
    /**
     * Create new PresentationProblemReportMessage instance.
     * @param options description of error and multiple optional fields for reporting problem
     */
    constructor(options: V1PresentationProblemReportMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
}
