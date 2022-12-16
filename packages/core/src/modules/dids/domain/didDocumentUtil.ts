import type { DidDocument } from './DidDocument'
import type { VerificationMethod } from './verificationMethod/VerificationMethod'

import { getKeyDidMappingByVerificationMethod } from './key-type/keyDidMapping'

export type DidPurpose =
  | 'authentication'
  | 'keyAgreement'
  | 'assertionMethod'
  | 'capabilityInvocation'
  | 'capabilityDelegation'

export type DidVerificationMethods = DidPurpose | 'verificationMethod'

export function keyReferenceToKey(didDocument: DidDocument, keyId: string) {
  // FIXME: we allow authentication keys as historically ed25519 keys have been used in did documents
  // for didcomm. In the future we should update this to only be allowed for IndyAgent and DidCommV1 services
  // as didcomm v2 doesn't have this issue anymore
  const verificationMethod = didDocument.dereferenceKey(keyId, ['authentication', 'keyAgreement'])
  const { getKeyFromVerificationMethod } = getKeyDidMappingByVerificationMethod(verificationMethod)
  const key = getKeyFromVerificationMethod(verificationMethod)

  return key
}

/**
 * Extracting the verification method for signature type
 * @param type Signature type
 * @param didDocument DidDocument
 * @returns verification method
 */
export async function findVerificationMethodByKeyType(
  keyType: string,
  didDocument: DidDocument
): Promise<VerificationMethod | null> {
  const didVerificationMethods: DidVerificationMethods[] = [
    'verificationMethod',
    'authentication',
    'keyAgreement',
    'assertionMethod',
    'capabilityInvocation',
    'capabilityDelegation',
  ]
  for await (const purpose of didVerificationMethods) {
    const key: VerificationMethod[] | (string | VerificationMethod)[] | undefined = didDocument[purpose]
    if (key instanceof Array) {
      for await (const method of key) {
        if (typeof method !== 'string') {
          if (method.type === keyType) {
            return method
          }
        }
      }
    }
  }

  return null
}
