import { IndyVdrError } from './IndyVdrError';
export declare class IndyVdrNotFoundError extends IndyVdrError {
    constructor(message: string, { cause }?: {
        cause?: Error;
    });
}
