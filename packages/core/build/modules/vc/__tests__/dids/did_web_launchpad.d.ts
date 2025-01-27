export declare const DID_WEB_LAUNCHPAD: {
    id: string;
    '@context': string[];
    verificationMethod: {
        id: string;
        type: string;
        controller: string;
        publicKeyBase58: string;
    }[];
    keyAgreement: {
        id: string;
        type: string;
        controller: string;
        publicKeyBase58: string;
    }[];
    authentication: string[];
    assertionMethod: string[];
    capabilityDelegation: string[];
    capabilityInvocation: string[];
};
