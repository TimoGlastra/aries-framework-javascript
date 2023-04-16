import { getAgentContext } from '../../../../../../tests'
import { JsonTransformer } from '../../../../../utils'
import { W3cCredentialService, W3cVerifiableCredential } from '../../../../vc'
import { PresentationExchangeService } from '../PresentationExchangeService'

import {
  animoUniversityCredential1,
  transmuteUniversityCredential1,
  transmuteUniversityCredential2,
} from './__fixtures__/credentials'
import { multiInputDescriptorPresentationDefinition } from './__fixtures__/multiInputDescriptor'
import { singleInputDescriptorPresentationDefinition } from './__fixtures__/singleInputDescriptor'

const findCredentialsByQueryMock = jest.fn().mockResolvedValue(
  JsonTransformer.fromJSON(
    [
      {
        ...animoUniversityCredential1,
        issuer: 'did:example:123',
      },
      {
        ...transmuteUniversityCredential1,
        credentialSubject: { ...transmuteUniversityCredential1.credentialSubject, birth_date: '2000-01-01' },
      },
      // transmuteUniversityCredential2,
    ],
    W3cVerifiableCredential
  )
)

const pexService = new PresentationExchangeService()
const agentContext = getAgentContext({
  registerInstances: [
    [
      W3cCredentialService,
      {
        findCredentialsByQuery: findCredentialsByQueryMock,
      },
    ],
  ],
})

describe('PresentationExchangeService', () => {
  describe('selectCredentialsForRequest', () => {
    xtest('multiple matches for single input_descriptor, no submission requirements or groups', async () => {
      const selected = await pexService.selectCredentialsForRequest(
        agentContext,
        singleInputDescriptorPresentationDefinition
      )

      // Should only pick the credential for a single match
      expect(selected).toEqual([transmuteUniversityCredential1])
    })

    xtest('multiple matches for multiple input_descriptors, no submission requirements or groups', async () => {
      const selected = await pexService.selectCredentialsForRequest(
        agentContext,
        multiInputDescriptorPresentationDefinition
      )

      // Should only pick the credential for a single match
      expect(selected).toEqual(expect.arrayContaining([transmuteUniversityCredential1, animoUniversityCredential1]))
    })

    test('multiple matches for multiple input_descriptors, no submission requirements or groups', async () => {
      const selected = await pexService.selectCredentialsForRequest(
        agentContext,
        multiInputDescriptorPresentationDefinition
      )

      // Should only pick the credential for a single match
      expect(selected).toEqual(expect.arrayContaining([transmuteUniversityCredential1, animoUniversityCredential1]))
    })
  })

  xdescribe('getCredentialsForRequest', () => {
    // This logic is mostly done in the PEX library, so we just have a test to make sure it works
    test('should only return credentials that match the presentation definition', async () => {
      const credentialsForRequest = await pexService.getCredentialsForRequest(
        agentContext,
        singleInputDescriptorPresentationDefinition
      )

      // It should not include eduVerifiableCredentialNoMatch
      expect(credentialsForRequest).toMatchObject({
        matches: [
          {
            name: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
            rule: 'all',
            vc_path: ['$.verifiableCredential[0]'],
          },
          {
            name: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
            rule: 'all',
            vc_path: ['$.verifiableCredential[1]'],
          },
        ],
        errors: [],
        areRequiredCredentialsPresent: 'info',
        verifiableCredential: [transmuteUniversityCredential1, transmuteUniversityCredential2],
        warnings: [],
      })
    })
  })

  //   test('flow', async () => {
  //     // validate
  //     pexService.validateDefinition(eduPresentationDefinition)

  //     // get credentials
  //     const credentialsForRequest = await pexService.getCredentialsForRequest(agentContext, eduPresentationDefinition)

  //     expect(findCredentialsByQueryMock).toHaveBeenCalledWith(agentContext, {
  //       $or: [
  //         {
  //           $or: [
  //             {
  //               expandedType: ['https://www.w3.org/2018/credentials/v1'],
  //             },
  //             {
  //               contexts: ['https://www.w3.org/2018/credentials/v1'],
  //             },
  //           ],
  //         },
  //       ],
  //     })

  //     console.log(credentialsForRequest)
  //   })
})
