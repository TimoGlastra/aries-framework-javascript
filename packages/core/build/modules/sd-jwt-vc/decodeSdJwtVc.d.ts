import type { SdJwtVcHeader, SdJwtVcPayload } from './SdJwtVcOptions';
import type { SdJwtVc } from './SdJwtVcService';
import type { SdJwtVcTypeMetadata } from './typeMetadata';
export declare function sdJwtVcHasher(data: string | ArrayBufferLike, alg: string): Uint8Array;
export declare function decodeSdJwtVc<Header extends SdJwtVcHeader = SdJwtVcHeader, Payload extends SdJwtVcPayload = SdJwtVcPayload>(compactSdJwtVc: string, typeMetadata?: SdJwtVcTypeMetadata): SdJwtVc<Header, Payload>;
