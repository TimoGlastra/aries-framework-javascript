import { AskarWallet } from '../../../../../../askar/src'
import { agentDependencies, getAgentConfig, getAgentContext, testLogger } from '../../../../../tests'
import { InjectionSymbols } from '../../../../constants'
import { JwsService, KeyType, SigningProviderRegistry } from '../../../../crypto'
import { JwaSignatureAlgorithm } from '../../../../crypto/jose/jwa'
import { getJwkFromKey } from '../../../../crypto/jose/jwk'
import { JsonTransformer } from '../../../../utils'
import { DidJwk, DidsModuleConfig } from '../../../dids'
import { W3cCredentialsModuleConfig } from '../../W3cCredentialsModuleConfig'
import { CREDENTIALS_CONTEXT_V1_URL } from '../../constants'
import { W3cCredential, W3cPresentation } from '../../models'
import { W3cJwtCredentialService } from '../W3cJwtCredentialService'
import { W3cJwtVerifiableCredential } from '../W3cJwtVerifiableCredential'

const config = getAgentConfig('W3cJwtCredentialService')
const wallet = new AskarWallet(config.logger, new agentDependencies.FileSystem(), new SigningProviderRegistry([]))
const agentContext = getAgentContext({
  wallet,
  registerInstances: [
    [InjectionSymbols.Logger, testLogger],
    [DidsModuleConfig, new DidsModuleConfig()],
  ],
})

const jwsService = new JwsService()
const w3cCredentialsModuleConfig = new W3cCredentialsModuleConfig({
  // documentLoader: customDocumentLoader,
})
const w3cJwtCredentialService = new W3cJwtCredentialService(w3cCredentialsModuleConfig, jwsService)

describe('W3cJwtCredentialService', () => {
  beforeAll(async () => {
    await wallet.createAndOpen(config.walletConfig)
  })

  test('sign a jwt vc', async () => {
    const key = await agentContext.wallet.createKey({
      keyType: KeyType.P256,
    })
    const didJwk = DidJwk.fromJwk(getJwkFromKey(key))

    const credential = JsonTransformer.fromJSON(
      {
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://purl.imsglobal.org/spec/ob/v3p0/context.json'],
        type: ['VerifiableCredential', 'VerifiableCredentialExtension', 'OpenBadgeCredential'],
        issuer: {
          id: didJwk.did,
          name: 'Jobs for the Future (JFF)',
          iconUrl: 'https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/images/JFF_LogoLockup.png',
          image: 'https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/images/JFF_LogoLockup.png',
        },
        name: 'JFF x vc-edu PlugFest 2',
        description: "MATTR's submission for JFF Plugfest 2",
        credentialBranding: {
          backgroundColor: '#464c49',
        },
        issuanceDate: '2023-01-25T16:58:06.292Z',
        credentialSubject: {
          //   id: 'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
          type: ['AchievementSubject'],
          achievement: {
            id: 'urn:uuid:bd6d9316-f7ae-4073-a1e5-2f7f5bd22922',
            name: 'JFF x vc-edu PlugFest 2 Interoperability',
            type: ['Achievement'],
            image: {
              id: 'https://w3c-ccg.github.io/vc-ed/plugfest-2-2022/images/JFF-VC-EDU-PLUGFEST2-badge-image.png',
              type: 'Image',
            },
            criteria: {
              type: 'Criteria',
              narrative:
                'Solutions providers earned this badge by demonstrating interoperability between multiple providers based on the OBv3 candidate final standard, with some additional required fields. Credential issuers earning this badge successfully issued a credential into at least two wallets.  Wallet implementers earning this badge successfully displayed credentials issued by at least two different credential issuers.',
            },
            description:
              'This credential solution supports the use of OBv3 and w3c Verifiable Credentials and is interoperable with at least two other solutions.  This was demonstrated successfully during JFF x vc-edu PlugFest 2.',
          },
        },
      },
      W3cCredential
    )

    const vcJwt = await w3cJwtCredentialService.signCredential(agentContext, {
      alg: JwaSignatureAlgorithm.ES256,
      format: 'jwt_vc',
      verificationMethod: didJwk.keyReference,
      credential,
    })

    console.log(vcJwt.serializedJwt)
    console.log(vcJwt.credential)

    const vcJwt2 = W3cJwtVerifiableCredential.fromSerializedJwt(vcJwt.serializedJwt)
    const result = await w3cJwtCredentialService.verifyCredential(agentContext, { credential: vcJwt2 })

    console.log(result)

    const presentation = new W3cPresentation({
      context: [CREDENTIALS_CONTEXT_V1_URL],
      type: ['VerifiablePresentation'],
      verifiableCredential: [vcJwt],
      id: '21ff21f1-3cf9-4fa3-88b4-a045efbb1b5f',
      // holder: didJwk.did,
    })

    await w3cJwtCredentialService.signPresentation(agentContext, {
      presentation,
      alg: JwaSignatureAlgorithm.ES256,
      challenge: 'daf942ad-816f-45ee-a9fc-facd08e5abca',
      format: 'jwt_vp',
      verificationMethod: didJwk.keyReference,
    })
  })
})
