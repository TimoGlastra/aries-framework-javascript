import { AgentMessage } from '@credo-ts/core';
export declare class AnswerMessage extends AgentMessage {
    /**
     * Create new AnswerMessage instance.
     * @param options
     */
    constructor(options: {
        id?: string;
        response: string;
        threadId: string;
    });
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    response: string;
}
