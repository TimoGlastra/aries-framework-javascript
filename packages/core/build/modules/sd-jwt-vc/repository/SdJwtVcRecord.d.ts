import type { TagsBase } from '../../../storage/BaseRecord';
import type { SdJwtVc } from '../SdJwtVcService';
import type { SdJwtVcTypeMetadata } from '../typeMetadata';
import { type JwaSignatureAlgorithm } from '../../../crypto';
import { BaseRecord } from '../../../storage/BaseRecord';
export type DefaultSdJwtVcRecordTags = {
    vct: string;
    /**
     * The sdAlg is the alg used for creating digests for selective disclosures
     */
    sdAlg: string;
    /**
     * The alg is the alg used to sign the SD-JWT
     */
    alg: JwaSignatureAlgorithm;
};
export type SdJwtVcRecordStorageProps = {
    id?: string;
    createdAt?: Date;
    tags?: TagsBase;
    compactSdJwtVc: string;
    typeMetadata?: SdJwtVcTypeMetadata;
};
export declare class SdJwtVcRecord extends BaseRecord<DefaultSdJwtVcRecordTags> {
    static readonly type = "SdJwtVcRecord";
    readonly type = "SdJwtVcRecord";
    compactSdJwtVc: string;
    typeMetadata?: SdJwtVcTypeMetadata;
    constructor(props: SdJwtVcRecordStorageProps);
    /**
     * credential is convenience method added to all credential records
     */
    get credential(): SdJwtVc;
    /**
     * encoded is convenience method added to all credential records
     */
    get encoded(): string;
    getTags(): {
        vct: string;
        sdAlg: string;
        alg: JwaSignatureAlgorithm;
    };
    clone(): this;
}
