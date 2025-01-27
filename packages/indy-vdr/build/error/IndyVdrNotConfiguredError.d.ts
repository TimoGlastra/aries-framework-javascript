import { IndyVdrError } from './IndyVdrError';
export declare class IndyVdrNotConfiguredError extends IndyVdrError {
    constructor(message: string, { cause }?: {
        cause?: Error;
    });
}
