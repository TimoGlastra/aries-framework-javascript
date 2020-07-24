export class LocalizedMessage {
  constructor(localizations: { en?: string }) {
    if (localizations) {
      this.en = localizations.en;
    }
  }

  en?: string;
}
