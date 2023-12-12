import type { ProblemReportMessageOptions } from '@aries-framework/core'

import { IsValidMessageType, ProblemReportMessage, parseMessageType } from '@aries-framework/core'

export type V1CredentialProblemReportMessageOptions = ProblemReportMessageOptions

/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/main/features/0035-report-problem/README.md
 */
export class V1CredentialProblemReportMessage extends ProblemReportMessage {
  public readonly allowDidSovPrefix = true

  @IsValidMessageType(V1CredentialProblemReportMessage.type)
  public readonly type = V1CredentialProblemReportMessage.type.messageTypeUri
  public static readonly type = parseMessageType('https://didcomm.org/issue-credential/1.0/problem-report')
}
