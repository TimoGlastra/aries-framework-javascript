import type { VerifiablePresentation, VerifiableCredential } from '@credo-ts/core';
import type { W3CVerifiableCredential as SphereonW3cVerifiableCredential, W3CVerifiablePresentation as SphereonW3cVerifiablePresentation, WrappedVerifiablePresentation } from '@sphereon/ssi-types';
export declare function getSphereonVerifiableCredential(verifiableCredential: VerifiableCredential): SphereonW3cVerifiableCredential;
export declare function getSphereonVerifiablePresentation(verifiablePresentation: VerifiablePresentation): SphereonW3cVerifiablePresentation;
export declare function getVerifiablePresentationFromSphereonWrapped(wrappedVerifiablePresentation: WrappedVerifiablePresentation): VerifiablePresentation;
