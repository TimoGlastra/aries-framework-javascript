import type { Router } from 'express';
import { OpenId4VcVerifierModuleConfig } from '../OpenId4VcVerifierModuleConfig';
export declare function configureFederationEndpoint(router: Router, federationConfig?: OpenId4VcVerifierModuleConfig['federation']): void;
