import type { KeyGenAlgorithm } from '../types';
import type { AlgorithmIdentifier } from '@peculiar/asn1-x509';
import { KeyType } from '../../KeyType';
export declare const credoKeyTypeIntoCryptoKeyAlgorithm: (keyType: KeyType) => KeyGenAlgorithm;
export declare const cryptoKeyAlgorithmToCredoKeyType: (algorithm: KeyGenAlgorithm) => KeyType;
export declare const spkiAlgorithmIntoCredoKeyType: (algorithm: AlgorithmIdentifier) => KeyType;
export declare const credoKeyTypeIntoSpkiAlgorithm: (keyType: KeyType) => AlgorithmIdentifier;
