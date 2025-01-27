import { CredoError } from '@credo-ts/core';
export declare class IndyVdrError extends CredoError {
    constructor(message: string, { cause }?: {
        cause?: Error;
    });
}
