import type { JsonObject } from '../../../types'

import { agentDependencies } from '../../../../../node/src'
import { Agent } from '../../../agent/Agent'
import { Attachment, AttachmentData } from '../../../decorators/attachment/Attachment'
import {
  CredentialPreview,
  CredentialRecord,
  CredentialRepository,
  CredentialState,
  INDY_CREDENTIAL_OFFER_ATTACHMENT_ID,
  IssueCredentialMessage,
  OfferCredentialMessage,
  ProposeCredentialMessage,
  RequestCredentialMessage,
} from '../../../modules/credentials'
import { DidCommMessageRecord, DidCommMessageRepository } from '../../didcomm'

async function getAgent() {
  const agent = new Agent(
    {
      label: 'test',
      walletConfig: { id: 'migration', key: 'migration' },
    },
    agentDependencies
  )
  await agent.initialize()

  return agent
}

async function saveCredentialRecord() {
  const agent = await getAgent()
  const repository = agent.injectionContainer.resolve(CredentialRepository)

  const credentialPreview = CredentialPreview.fromRecord({
    name: 'John',
    age: '99',
  })
  const offerAttachment = new Attachment({
    id: INDY_CREDENTIAL_OFFER_ATTACHMENT_ID,
    mimeType: 'application/json',
    data: new AttachmentData({
      base64:
        'eyJzY2hlbWFfaWQiOiJhYWEiLCJjcmVkX2RlZl9pZCI6IlRoN01wVGFSWlZSWW5QaWFiZHM4MVk6MzpDTDoxNzpUQUciLCJub25jZSI6Im5vbmNlIiwia2V5X2NvcnJlY3RuZXNzX3Byb29mIjp7fX0',
    }),
  })

  const credentialRecord = new CredentialRecord({
    proposalMessage: new ProposeCredentialMessage({
      comment: 'proposal',
      schemaId: 'b2de3540-2ecc-470b-8169-e0572b21d27a',
    }),
    offerMessage: new OfferCredentialMessage({
      comment: 'offer',
      credentialPreview: credentialPreview,
      offerAttachments: [offerAttachment],
    }),
    requestMessage: new RequestCredentialMessage({
      requestAttachments: [offerAttachment],
      comment: 'request',
    }),
    credentialMessage: new IssueCredentialMessage({
      credentialAttachments: [offerAttachment],
      comment: 'credential',
    }),
    credentialAttributes: credentialPreview.attributes,
    state: CredentialState.OfferSent,
    threadId: '61120bc0-a0e1-48b3-a865-3072065b9d29',
    connectionId: '123',
  })

  await repository.save(credentialRecord)
}

const enum CredentialRole {
  Issuer,
  Holder,
}

function getCredentialRole(credentialRecord: CredentialRecord) {
  // This only works for v1 records created before the switch to didcomm message records
  // But records created after the switch are already using the didcomm message record
  // So that shouldn't be a problem
  const holderStates = [
    CredentialState.Declined,
    CredentialState.ProposalSent,
    CredentialState.OfferReceived,
    CredentialState.RequestSent,
    CredentialState.CredentialReceived,
  ]

  // Credential id is only set when a credential is received
  if (credentialRecord.credentialId) {
    return CredentialRole.Holder
  }
  // If credentialRecord.credentialId is not set, and we're also not in state done it means we're the issuer.
  else if (credentialRecord.state === CredentialState.Done) {
    return CredentialRole.Issuer
  }
  // For these states we know for certain that we're the holder
  else if (holderStates.includes(credentialRecord.state)) {
    return CredentialRole.Holder
  }

  // For all other states we can be certain we're the issuer
  return CredentialRole.Issuer
}

const credentialRecordMessageKeys = ['proposalMessage', 'offerMessage', 'requestMessage', 'credentialMessage'] as const

async function migrateCredentialRecordTo020() {
  const agent = await getAgent()
  const credentialRepository = agent.injectionContainer.resolve(CredentialRepository)
  const didcommMessageRepository = agent.injectionContainer.resolve(DidCommMessageRepository)

  const allCredentials = await credentialRepository.getAll()

  for (const credentialRecord of allCredentials) {
    for (const messageKey of credentialRecordMessageKeys) {
      // FIXME: type
      const message = (credentialRecord as unknown as JsonObject)[messageKey] as JsonObject | undefined

      if (message) {
        const credentialRole = getCredentialRole(credentialRecord)
        const didCommMessageRole = didCommMessageRoleMapping[credentialRole][messageKey]

        const didcommMessageRecord = new DidCommMessageRecord({
          role: didCommMessageRole,
          associatedRecordId: credentialRecord.id,
          message,
        })
        await didcommMessageRepository.save(didcommMessageRecord)

        // FIXME: type
        delete (credentialRecord as unknown as JsonObject)[messageKey]
      }
    }

    await credentialRepository.update(credentialRecord)
  }
}

async function getCredentialRecords() {
  const agent = await getAgent()
  const credentialRepository = agent.injectionContainer.resolve(CredentialRepository)
  const didcommMessageRepository = agent.injectionContainer.resolve(DidCommMessageRepository)

  console.log(await credentialRepository.getAll())
  console.log(await didcommMessageRepository.getAll())
}
// saveCredentialRecord()
// migrateCredentialRecordTo020()
getCredentialRecords()
