import type { AgentContext } from '../../../agent/context'
import type { Key } from '../../../crypto'
import type {
  W3cJwtSignCredentialOptions,
  W3cJwtSignPresentationOptions,
  W3cJwtVerifyCredentialOptions,
  W3cJwtVerifyPresentationOptions,
} from '../W3cCredentialServiceOptions'

import { JwsService } from '../../../crypto'
import { AriesFrameworkError } from '../../../error'
import { injectable } from '../../../plugins'
import { JsonEncoder, JsonTransformer, TypedArrayEncoder, asArray } from '../../../utils'
import { getKeyFromVerificationMethod, VerificationMethod } from '../../dids'
import { W3cCredentialsModuleConfig } from '../W3cCredentialsModuleConfig'

import { W3cJwtVerifiableCredential } from './W3cJwtVerifiableCredential'
import { W3cJwtVerifiablePresentation } from './W3cJwtVerifiablePresentation'
import { getJwtPayloadFromCredential } from './credentialTransformer'
import { getJwtPayloadFromPresentation } from './presentationTransformer'

// TODO: move
/**
 * Asserts that the given credentials are all JWT VCs
 */
function assertOnlyW3cJwtVerifiableCredentials(
  credentials: unknown[]
): asserts credentials is W3cJwtVerifiableCredential[] {
  if (credentials.some((c) => !(c instanceof W3cJwtVerifiableCredential))) {
    throw new AriesFrameworkError('JWT VPs can only contain JWT VCs')
  }
}

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
    // Get the JWT payload for the JWT based on the JWT Encoding rules form the VC-DATA-MODEL
    // https://www.w3.org/TR/vc-data-model/#jwt-encoding
    const jwtPayload = getJwtPayloadFromCredential(options.credential)

    const jwt = await this.jwsService.createJwsCompact(agentContext, {
      // TODO: add convenience method to jwtPayload / JWS service so we
      // don't have to all this buffer stuff
      payload: JsonEncoder.toBuffer(jwtPayload.toJson()),
      key: await this.getPublicKeyFromVerificationMethod(agentContext, options.verificationMethod),
      protectedHeaderOptions: {
        typ: 'JWT',
        alg: options.alg,
        // FIXME: it should be possible to create a JWS without a kid (as the VC contains the issuerId)
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
  public async verifyCredential(agentContext: AgentContext, options: W3cJwtVerifyCredentialOptions) {
    if (options.verifyCredentialStatus) {
      throw new Error('Verifying credential status is not supported for JWT VCs')
    }

    const credential =
      options.credential instanceof W3cJwtVerifiableCredential
        ? options.credential
        : W3cJwtVerifiableCredential.fromSerializedJwt(options.credential)

    // TODO: improve JWT / JWS service API so we don't have to do this
    const [protectedHeader, payload, signature] = credential.jwt.serializedJwt.split('.')

    const result = await this.jwsService.verifyJws(agentContext, {
      jws: {
        header: {},
        signature,
        protected: protectedHeader,
      },
      payload: TypedArrayEncoder.fromBase64(payload),
    })

    // TODO: need to verify issuerId against the public key used for signing the JWS

    // TODO: improve result type
    return result
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
    // Get the JWT payload for the JWT based on the JWT Encoding rules form the VC-DATA-MODEL
    // https://www.w3.org/TR/vc-data-model/#jwt-encoding
    const jwtPayload = getJwtPayloadFromPresentation(options.presentation)

    // Set the nonce so it's included in the signature
    jwtPayload.additionalClaims.nonce = options.challenge

    const jwt = await this.jwsService.createJwsCompact(agentContext, {
      // TODO: add convenience method to jwtPayload / JWS service so we
      // don't have to all this buffer stuff
      payload: JsonEncoder.toBuffer(jwtPayload.toJson()),
      key: await this.getPublicKeyFromVerificationMethod(agentContext, options.verificationMethod),
      protectedHeaderOptions: {
        typ: 'JWT',
        alg: options.alg,
        // FIXME: it should be possible to create a JWS without a kid (as the VC contains the issuerId)
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
  public async verifyPresentation(agentContext: AgentContext, options: W3cJwtVerifyPresentationOptions) {
    const presentation =
      options.presentation instanceof W3cJwtVerifiablePresentation
        ? options.presentation
        : W3cJwtVerifiablePresentation.fromSerializedJwt(options.presentation)

    // TODO: improve JWT / JWS service API so we don't have to do this
    const [protectedHeader, payload, signature] = presentation.jwt.serializedJwt.split('.')

    const presentationResult = await this.jwsService.verifyJws(agentContext, {
      jws: {
        header: {},
        signature,
        protected: protectedHeader,
      },
      payload: TypedArrayEncoder.fromBase64(payload),
    })

    // To keep things simple, we only support JWT VCs in JWT VPs for now
    const credentials = asArray(presentation.presentation.verifiableCredential)
    assertOnlyW3cJwtVerifiableCredentials(credentials)

    for (const credential of credentials) {
      const credentialResult = await this.verifyCredential(agentContext, {
        credential,
        verifyCredentialStatus: options.verifyCredentialStatus,
      })

      // TODO: do something with credential result
      if (!credentialResult.isValid) {
        return credentialResult
      }
    }

    // TODO: need to verify holder against the credential

    // TODO: improve result type
    return presentationResult
  }

  // FIXME: this shouldn't use the documentLoader, also we should add a
  // general way to resolve keys based on a verificationMethod string (maybe in did module?)
  private async getPublicKeyFromVerificationMethod(
    agentContext: AgentContext,
    verificationMethod: string
  ): Promise<Key> {
    const documentLoader = this.w3cCredentialsModuleConfig.documentLoader(agentContext)
    const verificationMethodObject = await documentLoader(verificationMethod)
    const verificationMethodClass = JsonTransformer.fromJSON(verificationMethodObject.document, VerificationMethod)

    const key = getKeyFromVerificationMethod(verificationMethodClass)
    return key
  }
}
