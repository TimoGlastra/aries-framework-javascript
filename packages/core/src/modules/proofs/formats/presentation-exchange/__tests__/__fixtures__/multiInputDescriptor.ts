import type { PresentationDefinitionV1 } from '@sphereon/pex-models'

export const multiInputDescriptorPresentationDefinition = {
  id: '31e2f0f1-6b70-411d-b239-56aed5321884',
  purpose: 'To check if you have a valid college degree.',
  input_descriptors: [
    {
      id: 'df2accf9-1ecb-4f4e-af6d-21be152a881b',
      purpose: 'You must have a valid Bachelor Degree issued by Animo.',
      schema: [
        {
          uri: 'https://www.w3.org/2018/credentials/v1',
        },
      ],
      constraints: {
        fields: [
          {
            path: ['$.issuer', '$.vc.issuer', '$.iss'],
            filter: {
              type: 'string',
              pattern: 'did:web:animo.id',
            },
            predicate: 'required',
          },
        ],
      },
    },
    {
      id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
      purpose: 'You must have a valid Bachelor Degree issued by Transmute.',
      schema: [
        {
          uri: 'https://www.w3.org/2018/credentials/v1',
        },
      ],
      constraints: {
        fields: [
          {
            path: ['$.issuer', '$.vc.issuer', '$.iss'],
            filter: {
              type: 'string',
              pattern: 'did:web:vc.transmute.world',
            },
            predicate: 'required',
          },
        ],
      },
    },
  ],
} satisfies PresentationDefinitionV1
