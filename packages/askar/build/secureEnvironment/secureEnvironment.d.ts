export declare function importSecureEnvironment(): {
    sign: (id: string, message: Uint8Array) => Promise<Uint8Array>;
    getPublicBytesForKeyId: (id: string) => Uint8Array;
    generateKeypair: (id: string) => void;
};
