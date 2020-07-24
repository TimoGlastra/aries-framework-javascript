import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { LocalizedMessage } from '../../../decorators/l10n/LocalizedMessage';

export class ProblemReportDescription extends LocalizedMessage {
  constructor(options?: { code: string; en?: string }) {
    if (options) {
      super({
        en: options.en,
      });

      this.code = options.code;
    }
  }

  @IsString()
  code!: string;

  @IsString()
  @Expose({ name: 'en' })
  message?: string;
}
