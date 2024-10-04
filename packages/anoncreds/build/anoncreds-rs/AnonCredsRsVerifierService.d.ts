import type { AnonCredsVerifierService, VerifyProofOptions, VerifyW3cPresentationOptions } from '../services';
import type { AgentContext } from '@credo-ts/core';
export declare class AnonCredsRsVerifierService implements AnonCredsVerifierService {
    verifyProof(agentContext: AgentContext, options: VerifyProofOptions): Promise<boolean>;
    private verifyTimestamps;
    private getRevocationMetadataForCredentials;
    verifyW3cPresentation(agentContext: AgentContext, options: VerifyW3cPresentationOptions): Promise<boolean>;
}
