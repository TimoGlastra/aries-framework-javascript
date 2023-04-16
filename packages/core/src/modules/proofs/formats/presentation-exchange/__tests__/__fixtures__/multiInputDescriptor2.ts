import type { PresentationDefinitionV1 } from '@sphereon/pex-models'

export const multiInputDescriptorPresentationDefinition2 = {
  id: '32f54163-7166-48f1-93d8-ff217bdb0653',
  input_descriptors: [
    {
      id: 'bankaccount_input',
      name: 'Full Bank Account Routing Information',
      purpose: 'We can only remit payment to a currently-valid bank account, submitted as an ABA RTN + Acct # or IBAN.',
      schema: [
        {
          uri: 'https://www.w3.org/2018/credentials/v2',
        },
      ],
      constraints: {
        // limit_disclosure: 'required',
        fields: [
          {
            path: ['$.issuer', '$.vc.issuer', '$.iss'],
            purpose:
              'We can only verify bank accounts if they are attested by a trusted bank, auditor, or regulatory authority.',
            filter: {
              type: 'string',
              pattern: 'did:example:123',
            },
          },
        ],
      },
    },
    {
      id: 'us_passport_input',
      name: 'US Passport',
      schema: [
        {
          uri: 'https://www.w3.org/2018/credentials/v1',
        },
      ],
      constraints: {
        fields: [
          {
            path: ['$.credentialSubject.birth_date', '$.vc.credentialSubject.birth_date', '$.birth_date'],
            filter: {
              type: 'string',
              format: 'date',
              minimum: '1999-05-16',
            },
          },
        ],
      },
    },
  ],
} satisfies PresentationDefinitionV1
