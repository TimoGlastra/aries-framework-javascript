import { AnonCredsError } from './AnonCredsError';
export declare class AnonCredsRsError extends AnonCredsError {
    constructor(message: string, { cause }?: {
        cause?: Error;
    });
}
