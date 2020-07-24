export enum ProblemImpact {
  /**
   * this is a problem with a single message only.
   * The rest of the interaction may still be fine
   */
  message = 'message',

  /**
   * this is a problem that endangers or invalidates the entire thread
   */
  thread = 'thread',

  /**
   * this is a problem that endangers or invalidates the entire connection
   */
  connection = 'connection',
}
