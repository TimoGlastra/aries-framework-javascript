import type { ProblemReportErrorOptions, CredentialProblemReportReason } from '@credo-ts/core';
import { ProblemReportError } from '@credo-ts/core';
import { V1CredentialProblemReportMessage } from '../messages';
export interface V1CredentialProblemReportErrorOptions extends ProblemReportErrorOptions {
    problemCode: CredentialProblemReportReason;
}
export declare class V1CredentialProblemReportError extends ProblemReportError {
    problemReport: V1CredentialProblemReportMessage;
    constructor(message: string, { problemCode }: V1CredentialProblemReportErrorOptions);
}
