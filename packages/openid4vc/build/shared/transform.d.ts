import type { VerifiablePresentation, VerifiableCredential } from '@credo-ts/core';
import type { W3CVerifiableCredential as SphereonW3cVerifiableCredential, W3CVerifiablePresentation as SphereonW3cVerifiablePresentation, CompactSdJwtVc as SphereonCompactSdJwtVc, WrappedVerifiablePresentation } from '@sphereon/ssi-types';
export declare function getSphereonVerifiableCredential(verifiableCredential: VerifiableCredential): SphereonW3cVerifiableCredential | SphereonCompactSdJwtVc;
export declare function getSphereonVerifiablePresentation(verifiablePresentation: VerifiablePresentation): SphereonW3cVerifiablePresentation | SphereonCompactSdJwtVc;
export declare function getVerifiablePresentationFromSphereonWrapped(wrappedVerifiablePresentation: WrappedVerifiablePresentation): VerifiablePresentation;
