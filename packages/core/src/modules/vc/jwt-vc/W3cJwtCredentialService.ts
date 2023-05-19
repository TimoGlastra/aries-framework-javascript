import type { AgentContext } from '../../../agent/context'
import type { DidPurpose, VerificationMethod } from '../../dids'
import type {
  W3cJwtSignCredentialOptions,
  W3cJwtSignPresentationOptions,
  W3cJwtVerifyCredentialOptions,
  W3cJwtVerifyPresentationOptions,
} from '../W3cCredentialServiceOptions'
import type { W3cVerifyCredentialInnerResult, W3cVerifyCredentialResult, W3cVerifyPresentationResult } from '../models'

import { JwsService } from '../../../crypto'
import { getJwkFromKey } from '../../../crypto/jose/jwk'
import { AriesFrameworkError } from '../../../error'
import { injectable } from '../../../plugins'
import { asArray, isDid, MessageValidator } from '../../../utils'
import { DidResolverService, getKeyFromVerificationMethod } from '../../dids'
import { W3cCredentialsModuleConfig } from '../W3cCredentialsModuleConfig'

import { W3cJwtVerifiableCredential } from './W3cJwtVerifiableCredential'
import { W3cJwtVerifiablePresentation } from './W3cJwtVerifiablePresentation'
import { getJwtPayloadFromCredential } from './credentialTransformer'
import { assertOnlyW3cJwtVerifiableCredentials } from './jwtUtil'
import { getJwtPayloadFromPresentation } from './presentationTransformer'

/**
 * Supports signing and verification of credentials according to the [Verifiable Credential Data Model](https://www.w3.org/TR/vc-data-model)
 * using [Json Web Tokens](https://www.w3.org/TR/vc-data-model/#json-web-token).
 */
@injectable()
export class W3cJwtCredentialService {
  private w3cCredentialsModuleConfig: W3cCredentialsModuleConfig
  private jwsService: JwsService

  public constructor(w3cCredentialsModuleConfig: W3cCredentialsModuleConfig, jwsService: JwsService) {
    this.w3cCredentialsModuleConfig = w3cCredentialsModuleConfig
    this.jwsService = jwsService
  }

  /**
   * Signs a credential
   */
  public async signCredential(
    agentContext: AgentContext,
    options: W3cJwtSignCredentialOptions
  ): Promise<W3cJwtVerifiableCredential> {
    // Validate the instance
    MessageValidator.validateSync(options.credential)

    // Get the JWT payload for the JWT based on the JWT Encoding rules form the VC-DATA-MODEL
    // https://www.w3.org/TR/vc-data-model/#jwt-encoding
    const jwtPayload = getJwtPayloadFromCredential(options.credential)

    if (!isDid(options.verificationMethod)) {
      throw new AriesFrameworkError(`Only did identifiers are supported as verification method`)
    }

    const verificationMethod = await this.resolveVerificationMethod(agentContext, options.verificationMethod)
    const key = getKeyFromVerificationMethod(verificationMethod)

    const jwt = await this.jwsService.createJwsCompact(agentContext, {
      payload: jwtPayload,
      key,
      protectedHeaderOptions: {
        typ: 'JWT',
        alg: options.alg,
        kid: options.verificationMethod,
      },
    })

    // TODO: this re-parses and validates the credential in the JWT, which is not necessary.
    // We should somehow create an instance of W3cJwtVerifiableCredential directly from the JWT
    const jwtVc = W3cJwtVerifiableCredential.fromSerializedJwt(jwt)

    return jwtVc
  }

  /**
   * Verifies the signature(s) of a credential
   *
   * @param credential the credential to be verified
   * @returns the verification result
   */
  public async verifyCredential(
    agentContext: AgentContext,
    options: W3cJwtVerifyCredentialOptions
  ): Promise<W3cVerifyCredentialResult> {
    try {
      if (options.verifyCredentialStatus) {
        throw new AriesFrameworkError('Verifying credential status is not supported for JWT VCs')
      }

      // If instance is provided as input, we want to validate the credential (otherwise it's done in the fromSerializedJwt method below)
      if (options.credential instanceof W3cJwtVerifiableCredential) {
        MessageValidator.validateSync(options.credential.credential)
      }

      const credential =
        options.credential instanceof W3cJwtVerifiableCredential
          ? options.credential
          : W3cJwtVerifiableCredential.fromSerializedJwt(options.credential)

      // Verify the JWT payload (verifies whether it's not expired, etc...)
      credential.jwt.payload.validate()

      // // We only support dids for now, and the `kid` property MUST point to the key within the did document
      // // We may want to loosen this and add alternatives, but this is the most straightforward way to do it.
      // if (!credential.jwt.header.kid || !isDid(credential.jwt.header.kid)) {
      //   throw new AriesFrameworkError(
      //     `JWT header property 'kid' value '${credential.jwt.header.kid}' is not a valid did.`
      //   )
      // }

      // Ways to resolve the publicKey for a credentials
      // - header `kid`
      // - issuer property in the payload and then finding a key in the did document
      //     how does this work?
      //     veramo just tries to verify with all keys in the did document that match the
      //      alg etc.. https://github.com/decentralized-identity/did-jwt/blob/master/src/JWT.ts#L573-L582
      // the spec specifies it may be used if multiple keys are available for a did
      // Answer: we resolve the did, check the number of keys for hte purpose, alg we have and if there's multiple we
      // require the kid to be set in the header

      // NOTE: we only support 'assertionMethod' for now. We may want to allow to pass a `proofPurpose` to the verify method.
      const verificationMethod = await this.resolveVerificationMethod(agentContext, credential.jwt.header.kid, [
        'assertionMethod',
      ])
      const key = getKeyFromVerificationMethod(verificationMethod)
      const jwk = getJwkFromKey(key)

      // Verify the controller of the verificationMethod matches the issuer of the credential
      if (verificationMethod.controller !== credential.jwt.payload.iss) {
        throw new AriesFrameworkError(
          `Verification method controller '${verificationMethod.controller}' does not match the issuer '${credential.jwt.header.iss}'`
        )
      }

      // Verify the JWS signature
      const result = await this.jwsService.verifyJws(agentContext, {
        jws: credential.jwt.serializedJwt,
        keyResolver: (kid: string) => {
          // We have pre-fetched the verificationMethod for the kid, this shouldn't happen
          if (kid !== credential.jwt.header.kid) throw new AriesFrameworkError(`Unexpected kid '${kid}'`)

          return jwk
        },
      })

      if (!result.isValid) {
        throw new AriesFrameworkError('Invalid JWS signature')
      }

      // Make sure the JWS is signed by the 'issuer' of the credential
      if (!result.signerKeys.some((signerKey) => signerKey.fingerprint === signerKey.fingerprint)) {
        throw new AriesFrameworkError('Credential is not signed by the issuer of the credential')
      }

      return {
        verified: true,
        results: [{ credential, verified: true }],
      }
    } catch (error) {
      return {
        verified: false,
        results: [{ credential: options.credential, verified: false, error: error }],
        error,
      }
    }
  }

  /**
   * Signs a presentation including the credentials it includes
   *
   * @param presentation the presentation to be signed
   * @returns the signed presentation
   */
  public async signPresentation(
    agentContext: AgentContext,
    options: W3cJwtSignPresentationOptions
  ): Promise<W3cJwtVerifiablePresentation> {
    // Validate the instance
    MessageValidator.validateSync(options.presentation)

    // Get the JWT payload for the JWT based on the JWT Encoding rules form the VC-DATA-MODEL
    // https://www.w3.org/TR/vc-data-model/#jwt-encoding
    const jwtPayload = getJwtPayloadFromPresentation(options.presentation)

    // Set the nonce so it's included in the signature
    jwtPayload.additionalClaims.nonce = options.challenge
    jwtPayload.aud = options.domain

    const verificationMethod = await this.resolveVerificationMethod(agentContext, options.verificationMethod)

    const jwt = await this.jwsService.createJwsCompact(agentContext, {
      payload: jwtPayload,
      key: getKeyFromVerificationMethod(verificationMethod),
      protectedHeaderOptions: {
        typ: 'JWT',
        alg: options.alg,
        kid: options.verificationMethod,
      },
    })

    // TODO: this re-parses and validates the presentation in the JWT, which is not necessary.
    // We should somehow create an instance of W3cJwtVerifiablePresentation directly from the JWT
    const jwtVp = W3cJwtVerifiablePresentation.fromSerializedJwt(jwt)

    return jwtVp
  }

  /**
   * Verifies a presentation including the credentials it includes
   *
   * @param presentation the presentation to be verified
   * @returns the verification result
   */
  public async verifyPresentation(
    agentContext: AgentContext,
    options: W3cJwtVerifyPresentationOptions
  ): Promise<W3cVerifyPresentationResult> {
    try {
      // If instance is provided as input, we want to validate the presentation
      if (options.presentation instanceof W3cJwtVerifiablePresentation) {
        MessageValidator.validateSync(options.presentation.presentation)
      }

      const presentation =
        options.presentation instanceof W3cJwtVerifiablePresentation
          ? options.presentation
          : W3cJwtVerifiablePresentation.fromSerializedJwt(options.presentation)

      // Verify the JWT payload (verifies whether it's not expired, etc...)
      presentation.jwt.payload.validate()

      // Make sure challenge matches nonce
      if (options.challenge !== presentation.jwt.payload.additionalClaims.nonce) {
        throw new AriesFrameworkError(`JWT payload 'nonce' does not match challenge '${options.challenge}'`)
      }

      const audArray = asArray(presentation.jwt.payload.aud)
      if (options.domain && !audArray.includes(options.domain)) {
        throw new AriesFrameworkError(`JWT payload 'aud' does not include domain '${options.domain}'`)
      }

      // We only support dids for now, and the `kid` property MUST pont to the key within the did document
      // We may want to loosen this and add alternatives, but this is the most straightforward way to do it.
      if (!presentation.jwt.header.kid || !isDid(presentation.jwt.header.kid)) {
        throw new AriesFrameworkError(
          `JWT header property 'kid' value '${presentation.jwt.header.kid}' is not a valid did.`
        )
      }

      // NOTE: we only support 'authentication' for now. We may want to allow to pass a `proofPurpose` to the verify method.
      const verificationMethod = await this.resolveVerificationMethod(agentContext, presentation.jwt.header.kid, [
        'authentication',
      ])
      const key = getKeyFromVerificationMethod(verificationMethod)
      const jwk = getJwkFromKey(key)

      // Verify the controller of the verificationMethod matches the 'holder' of the presentation
      if (presentation.jwt.payload.iss && verificationMethod.controller !== presentation.jwt.payload.iss) {
        throw new AriesFrameworkError(
          `Verification method controller '${verificationMethod.controller}' does not match the holder '${presentation.jwt.header.iss}'`
        )
      }

      // Verify the JWS signature
      const result = await this.jwsService.verifyJws(agentContext, {
        jws: presentation.jwt.serializedJwt,
        kidResolver: (kid: string) => {
          // We have pre-fetched the verificationMethod for the kid, this shouldn't happen
          if (kid !== presentation.jwt.header.kid) throw new AriesFrameworkError(`Unexpected kid '${kid}'`)

          return jwk
        },
      })

      if (!result.isValid) {
        throw new AriesFrameworkError('Invalid JWS signature on presentation')
      }

      // To keep things simple, we only support JWT VCs in JWT VPs for now
      const credentials = asArray(presentation.presentation.verifiableCredential)
      assertOnlyW3cJwtVerifiableCredentials(credentials)

      // Verify all credentials in parallel, and await the result
      const credentialResults = await Promise.all(
        credentials.map(async (credential) => {
          const credentialResult = await this.verifyCredential(agentContext, {
            credential,
            verifyCredentialStatus: options.verifyCredentialStatus,
          })

          // Check whether any of the credentialSubjectIds is the same as the controller of the verificationMethod
          // This authenticates the presentation creator controls one of the credentialSubject ids.
          // NOTE: this doesn't take into account the case where the credentialSubject is no the holder. In the
          // future we can add support for other flows, but for now this is the most common use case.
          // TODO: should this be handled on a higher level? I don't really see it being handled in the jsonld lib
          // or in the did-jwt-vc lib (it seems they don't even verify the credentials itself), but we probably need some
          // more experience on the use cases before we loosen the restrictions (as it means we need to handle it on a higher layer).
          const credentialSubjectIds = credential.credentialSubjectIds
          const presentationAuthenticatesCredentialSubject = credentialSubjectIds.some(
            (subjectId) => verificationMethod.controller === subjectId
          )

          if (credentialSubjectIds.length > 0 && !presentationAuthenticatesCredentialSubject) {
            return {
              verified: false,
              credential,
              error: new AriesFrameworkError(
                'Credential has one or more credentialSubject ids, but presentation does not authenticate credential subject'
              ),
              presentationAuthenticatesCredentialSubject,
            }
          }

          return {
            verified: credentialResult.verified,
            error: credentialResult.error,
            credential,
            presentationAuthenticatesCredentialSubject,
          }
        })
      )

      return {
        verified: credentialResults.every((result) => result.verified),
        credentialResults,
        presentationResult: {
          verified: true,
          presentation,
        },
      }
    } catch (error) {
      return {
        verified: false,
        presentationResult: {
          verified: false,
          error,
          presentation: options.presentation,
        },
        credentialResults: [],
        error,
      }
    }
  }

  private async resolveVerificationMethod(
    agentContext: AgentContext,
    verificationMethod: string,
    allowsPurposes?: DidPurpose[]
  ): Promise<VerificationMethod> {
    const didResolver = agentContext.dependencyManager.resolve(DidResolverService)
    const didDocument = await didResolver.resolveDidDocument(agentContext, verificationMethod)

    return didDocument.dereferenceKey(verificationMethod, allowsPurposes)
  }
}
