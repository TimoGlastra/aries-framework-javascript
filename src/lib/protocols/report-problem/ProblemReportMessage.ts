import { Equals, IsString, ValidateNested, IsArray, IsEnum, IsDate } from 'class-validator';
import { Expose, Type } from 'class-transformer';

import { AgentMessage } from '../../agent/AgentMessage';
import { LocalizedMessage } from '../../decorators/l10n/LocalizedMessage';
import { ProblemWhoRetries } from './models/ProblemWhoRetries';
import { ProblemImpact } from './models/ProblemImpact';
import { ProblemReportDescription } from './models/ProblemReportDescription';
import { MessageType } from './messages';

/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0035-report-problem/README.md#the-problem-report-message-type
 *
 * @todo add internationalization support. The description now assumes english language
 * @todo the sample in the RFC is not completely in line with the RFC spec.
 *       Especially the localization of 'description'
 */
export class ProblemReportMessage extends AgentMessage {
  /**
   * Create new ProblemReport message instance.
   *
   * @param options
   */
  constructor(options: {
    code: string;
    id?: string;
    threadId?: string;
    parentThreadId?: string;
    enDescription?: string;
    problemItems?: { [key: string]: string }[];
    whoRetries?: ProblemWhoRetries;
    fixHint?: LocalizedMessage;
    impact?: ProblemImpact;
    where?: string;
    noticedTime?: Date;
    trackingUri?: string;
    escalationUri?: string;
  }) {
    super();

    if (options) {
      this.id = options.id || this.generateId();
      this.description = new ProblemReportDescription({
        code: options.code,
        en: options.enDescription,
      });
      this.problemItems = options.problemItems;
      this.whoRetries = options.whoRetries;
      this.fixHint = options.fixHint;
      this.impact = options.impact;
      this.where = options.where;
      this.noticedTime = options.noticedTime;
      this.trackingUri = options.trackingUri;
      this.escalationUri = options.escalationUri;

      // If the problem was triggered during the processing of a message
      // - the threadId is the @id of the message that triggered the problem
      // - the parentThreadId is the threadId of the message that triggered the problem
      if (options.threadId || options.parentThreadId) {
        this.setThread({
          threadId: options.threadId,
          parentThreadId: options.parentThreadId,
        });
      }
    }
  }

  @Equals(ProblemReportMessage.type)
  readonly type = ProblemReportMessage.type;
  static readonly type = MessageType.ProblemReport;

  @Type(() => ProblemReportDescription)
  @ValidateNested()
  description!: ProblemReportDescription;

  /**
   * A list of one or more key/value pairs that are parameters about the problem
   *
   * @todo create correct type. It is just a plain key-value JSON object.
   */
  @IsArray()
  @Expose({ name: 'problem_items' })
  problemItems?: { [key: string]: string }[];

  /**
   * This property tells whether a problem is considered permanent
   * and who the sender of the problem report believes should have
   * the responsibility to resolve it by retrying
   */
  @IsEnum(ProblemWhoRetries)
  @Expose({ name: 'who_retries' })
  whoRetries?: ProblemWhoRetries;

  /**
   * human-readable, localized suggestions about how to fix this instance of the problem
   */
  @ValidateNested()
  @Type(() => LocalizedMessage)
  fixHint?: LocalizedMessage;

  /**
   * describes the breadth of impact of the problem.
   */
  @IsEnum(ProblemImpact)
  impact?: ProblemImpact;

  /**
   * describes where the error happened, from the perspective of the reporter.
   * Must use "you" or "me" or "other" prefix, followed by a suffix like "cloud", "edge", "wire", "agency", etc.
   *
   * @todo change type to hint for possible combinations of prefix and suffix
   */
  @IsString()
  where?: string;

  /**
   * Standard time entry of when the problem was detected.
   */
  @IsDate()
  @Type(() => Date)
  @Expose({ name: 'noticed_time' })
  noticedTime?: Date;

  /**
   * URI that allows the recipient to track the status of the error.
   */
  @IsString()
  @Expose({ name: 'tracking_uri' })
  trackingUri?: string;

  /**
   * URI where additional help on the issue can be received.
   */
  @IsString()
  @Expose({ name: 'escalation_uri' })
  escalationUri?: string;
}
