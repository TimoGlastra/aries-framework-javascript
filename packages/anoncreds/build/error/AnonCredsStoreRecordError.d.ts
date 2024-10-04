import { AnonCredsError } from './AnonCredsError';
export declare class AnonCredsStoreRecordError extends AnonCredsError {
    constructor(message: string, { cause }?: {
        cause?: Error;
    });
}
