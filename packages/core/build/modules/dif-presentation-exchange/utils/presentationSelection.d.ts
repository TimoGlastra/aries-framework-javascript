import type { SingleOrArray } from '../../../utils';
import type { W3cJsonLdVerifiableCredential, W3cJwtVerifiableCredential } from '../../vc';
import type { DifPresentationExchangeDefinition, DifPresentationExchangeSubmission, VerifiablePresentation } from '../models';
import { MdocDeviceResponse } from '../../mdoc';
import { ClaimFormat, W3cJsonLdVerifiablePresentation, W3cJwtVerifiablePresentation } from '../../vc';
export type DifPexPresentationWithDescriptor = ReturnType<typeof extractPresentationsWithDescriptorsFromSubmission>[number];
export declare function extractPresentationsWithDescriptorsFromSubmission(presentations: SingleOrArray<VerifiablePresentation>, submission: DifPresentationExchangeSubmission, definition: DifPresentationExchangeDefinition): ({
    readonly format: ClaimFormat.MsoMdoc;
    readonly descriptor: import("@sphereon/pex-models").Descriptor;
    readonly presentation: MdocDeviceResponse;
    readonly credential: import("../../mdoc").Mdoc;
    readonly inputDescriptor: import("@sphereon/pex-models").InputDescriptorV2 | import("@sphereon/pex-models").InputDescriptorV1;
} | {
    readonly format: ClaimFormat.JwtVp | ClaimFormat.LdpVp;
    readonly descriptor: import("@sphereon/pex-models").Descriptor;
    readonly presentation: W3cJwtVerifiablePresentation | W3cJsonLdVerifiablePresentation;
    readonly credential: W3cJsonLdVerifiableCredential | W3cJwtVerifiableCredential;
    readonly inputDescriptor: import("@sphereon/pex-models").InputDescriptorV2 | import("@sphereon/pex-models").InputDescriptorV1;
} | {
    readonly format: ClaimFormat.SdJwtVc;
    readonly descriptor: import("@sphereon/pex-models").Descriptor;
    readonly presentation: import("../../sd-jwt-vc").SdJwtVc<import("../../sd-jwt-vc").SdJwtVcHeader, import("../../sd-jwt-vc").SdJwtVcPayload>;
    readonly credential: import("../../sd-jwt-vc").SdJwtVc<import("../../sd-jwt-vc").SdJwtVcHeader, import("../../sd-jwt-vc").SdJwtVcPayload>;
    readonly inputDescriptor: import("@sphereon/pex-models").InputDescriptorV2 | import("@sphereon/pex-models").InputDescriptorV1;
})[];
