import { getMockConnection } from '../../../tests/helpers'
import testLogger from '../../../tests/logger'
import { ConnectionInvitationMessage, ConnectionRole, DidDoc, DidCommService } from '../../modules/connections'
import { TransportService } from '../TransportService'

const logger = testLogger

describe('TransportService', () => {
  describe('findServices', () => {
    let transportService: TransportService
    let theirDidDoc: DidDoc
    const testDidCommService = new DidCommService({
      id: `<did>;indy`,
      serviceEndpoint: 'https://example.com',
      recipientKeys: ['verkey'],
    })

    beforeEach(() => {
      theirDidDoc = new DidDoc({
        id: 'test-456',
        publicKey: [],
        authentication: [],
        service: [testDidCommService],
      })

      transportService = new TransportService(logger)
    })

    test(`returns empty array when there is no their DidDoc and role is ${ConnectionRole.Inviter}`, () => {
      const connection = getMockConnection({ id: 'test-123', role: ConnectionRole.Inviter })
      connection.theirDidDoc = undefined
      expect(transportService.findDidCommServices(connection)).toEqual([])
    })

    test(`returns empty array when there is no their DidDoc, no invitation and role is ${ConnectionRole.Invitee}`, () => {
      const connection = getMockConnection({ id: 'test-123', role: ConnectionRole.Invitee })
      connection.theirDidDoc = undefined
      connection.invitation = undefined
      expect(transportService.findDidCommServices(connection)).toEqual([])
    })

    test(`returns service from their DidDoc`, () => {
      const connection = getMockConnection({ id: 'test-123', theirDidDoc })
      expect(transportService.findDidCommServices(connection)).toEqual([testDidCommService])
    })

    test(`returns service from invitation when there is no their DidDoc and role is ${ConnectionRole.Invitee}`, () => {
      const invitation = new ConnectionInvitationMessage({
        label: 'test',
        recipientKeys: ['verkey'],
        serviceEndpoint: 'ws://invitationEndpoint.com',
      })
      const connection = getMockConnection({ id: 'test-123', role: ConnectionRole.Invitee, invitation })
      connection.theirDidDoc = undefined
      expect(transportService.findDidCommServices(connection)).toEqual([
        new DidCommService({
          id: 'test-123-invitation',
          serviceEndpoint: 'ws://invitationEndpoint.com',
          routingKeys: [],
          recipientKeys: ['verkey'],
        }),
      ])
    })
  })
})
