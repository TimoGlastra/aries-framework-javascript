import { AutoAcceptCredential, AutoAcceptProof } from '@credo-ts/core';
/**
 * Returns the credential auto accept config based on priority:
 *	- The record config takes first priority
 *	- Otherwise the agent config
 *	- Otherwise {@link AutoAcceptCredential.Never} is returned
 */
export declare function composeCredentialAutoAccept(recordConfig?: AutoAcceptCredential, agentConfig?: AutoAcceptCredential): AutoAcceptCredential;
/**
 * Returns the proof auto accept config based on priority:
 *	- The record config takes first priority
 *	- Otherwise the agent config
 *	- Otherwise {@link AutoAcceptProof.Never} is returned
 */
export declare function composeProofAutoAccept(recordConfig?: AutoAcceptProof, agentConfig?: AutoAcceptProof): AutoAcceptProof;
