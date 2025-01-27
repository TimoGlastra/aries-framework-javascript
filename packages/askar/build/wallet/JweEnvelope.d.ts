export declare class JweRecipient {
    encryptedKey: string;
    header?: Record<string, string>;
    constructor(options: {
        encryptedKey: Uint8Array;
        header?: Record<string, string>;
    });
}
export interface JweEnvelopeOptions {
    protected: string;
    unprotected?: string;
    recipients?: JweRecipient[];
    ciphertext: string;
    iv: string;
    tag: string;
    aad?: string;
    header?: string[];
    encryptedKey?: string;
}
export declare class JweEnvelope {
    protected: string;
    unprotected?: string;
    recipients?: JweRecipient[];
    ciphertext: string;
    iv: string;
    tag: string;
    aad?: string;
    header?: string[];
    encryptedKey?: string;
    constructor(options: JweEnvelopeOptions);
    toJson(): Record<string, any>;
}
