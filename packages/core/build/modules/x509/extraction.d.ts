import type { Jwt } from '../../crypto';
import { X509Certificate } from './X509Certificate';
export declare function extractX509CertificatesFromJwt(jwt: Jwt): X509Certificate[] | undefined;
