import type { AnonCredsCredentialsForProofRequest, AnonCredsGetCredentialsForProofRequestOptions } from '../formats';
import type { AnonCredsProofRequest } from '../models';
import type { AgentContext } from '@credo-ts/core';
export declare const getCredentialsForAnonCredsProofRequest: (agentContext: AgentContext, proofRequest: AnonCredsProofRequest, options: AnonCredsGetCredentialsForProofRequestOptions) => Promise<AnonCredsCredentialsForProofRequest>;
