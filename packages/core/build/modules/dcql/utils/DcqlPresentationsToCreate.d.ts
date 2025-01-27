import type { SdJwtVcRecord } from '../../sd-jwt-vc';
import type { DcqlCredentialsForRequest } from '../models';
import type { DcqlSdJwtVcCredential, DcqlMdocCredential, DcqlW3cVcCredential } from 'dcql';
import { MdocRecord } from '../../mdoc';
import { W3cCredentialRecord, ClaimFormat } from '../../vc';
export interface DcqlSdJwtVcPresentationToCreate {
    claimFormat: ClaimFormat.SdJwtVc;
    subjectIds: [];
    credentialRecord: SdJwtVcRecord;
    disclosedPayload: DcqlSdJwtVcCredential.Claims;
}
export interface DcqlJwtVpPresentationToCreate {
    claimFormat: ClaimFormat.JwtVp;
    subjectIds: [string];
    credentialRecord: W3cCredentialRecord;
    disclosedPayload: DcqlW3cVcCredential.Claims;
}
export interface DcqlLdpVpPresentationToCreate {
    claimFormat: ClaimFormat.LdpVp;
    subjectIds: undefined | [string];
    credentialRecord: W3cCredentialRecord;
    disclosedPayload: DcqlW3cVcCredential.Claims;
}
export interface DcqlMdocPresentationToCreate {
    claimFormat: ClaimFormat.MsoMdoc;
    subjectIds: [];
    credentialRecord: MdocRecord;
    disclosedPayload: DcqlMdocCredential.NameSpaces;
}
export type DcqlPresentationToCreate = Record<string, DcqlSdJwtVcPresentationToCreate | DcqlJwtVpPresentationToCreate | DcqlLdpVpPresentationToCreate | DcqlMdocPresentationToCreate>;
export declare function dcqlGetPresentationsToCreate(credentialsForInputDescriptor: DcqlCredentialsForRequest): DcqlPresentationToCreate;
