import type { ProblemReportMessageOptions } from '@credo-ts/core';
import { ProblemReportMessage } from '@credo-ts/core';
export type ActionMenuProblemReportMessageOptions = ProblemReportMessageOptions;
/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0035-report-problem/README.md
 * @internal
 */
export declare class ActionMenuProblemReportMessage extends ProblemReportMessage {
    /**
     * Create new ConnectionProblemReportMessage instance.
     * @param options
     */
    constructor(options: ActionMenuProblemReportMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
}
