import { CredoError } from '@credo-ts/core';
export declare class AnonCredsError extends CredoError {
    constructor(message: string, { cause }?: {
        cause?: Error;
    });
}
