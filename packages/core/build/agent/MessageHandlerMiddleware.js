"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandlerMiddlewareRunner = void 0;
class MessageHandlerMiddlewareRunner {
    static async run(middlewares, inboundMessageContext) {
        const compose = (middlewares) => {
            return async function (inboundMessageContext) {
                let index = -1;
                async function dispatch(i) {
                    if (i <= index)
                        throw new Error('next() called multiple times');
                    index = i;
                    const fn = middlewares[i];
                    if (!fn)
                        return;
                    await fn(inboundMessageContext, () => dispatch(i + 1));
                }
                await dispatch(0);
            };
        };
        const composed = compose(middlewares);
        await composed(inboundMessageContext);
    }
}
exports.MessageHandlerMiddlewareRunner = MessageHandlerMiddlewareRunner;
//# sourceMappingURL=MessageHandlerMiddleware.js.map