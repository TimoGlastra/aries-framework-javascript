import type { ProblemReportErrorOptions, PresentationProblemReportReason } from '@credo-ts/core';
import { ProblemReportError } from '@credo-ts/core';
import { V1PresentationProblemReportMessage } from '../messages';
interface V1PresentationProblemReportErrorOptions extends ProblemReportErrorOptions {
    problemCode: PresentationProblemReportReason;
}
export declare class V1PresentationProblemReportError extends ProblemReportError {
    message: string;
    problemReport: V1PresentationProblemReportMessage;
    constructor(message: string, { problemCode }: V1PresentationProblemReportErrorOptions);
}
export {};
