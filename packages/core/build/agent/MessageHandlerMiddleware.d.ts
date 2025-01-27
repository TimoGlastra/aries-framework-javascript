import type { InboundMessageContext } from './models/InboundMessageContext';
export interface MessageHandlerMiddleware {
    (inboundMessageContext: InboundMessageContext, next: () => Promise<void>): Promise<void>;
}
export declare class MessageHandlerMiddlewareRunner {
    static run(middlewares: MessageHandlerMiddleware[], inboundMessageContext: InboundMessageContext): Promise<void>;
}
