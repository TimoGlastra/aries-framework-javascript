import type { Logger } from '@credo-ts/core';
/**
 * Keep track of the total number of tenant sessions currently active. This doesn't actually manage the tenant sessions itself, or have anything to do with
 * the agent context. It merely counts the current number of sessions, and provides a mutex to lock new sessions from being created once the maximum number
 * of sessions has been created. Session that can't be required withing the specified sessionsAcquireTimeout will throw an error.
 */
export declare class TenantSessionMutex {
    private _currentSessions;
    readonly maxSessions: number;
    private sessionMutex;
    private logger;
    constructor(logger: Logger, maxSessions: number | undefined, sessionAcquireTimeout: number);
    /**
     * Getter to retrieve the total number of current sessions.
     */
    get currentSessions(): number;
    private set currentSessions(value);
    /**
     * Wait to acquire a session. Will use the session semaphore to keep total number of sessions limited.
     * For each session that is acquired using this method, the sessions MUST be closed by calling `releaseSession`.
     * Failing to do so can lead to deadlocks over time.
     */
    acquireSession(): Promise<void>;
    /**
     * Release a session from the session mutex. If the total number of current sessions drops below
     * the max number of sessions, the session mutex will be released so new sessions can be started.
     */
    releaseSession(): void;
}
