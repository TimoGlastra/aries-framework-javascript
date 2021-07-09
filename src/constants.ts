export const InjectionSymbols = {
  Wallet: Symbol('Wallet'),
  Indy: Symbol('Indy'),
  MessageRepository: Symbol('MessageRepository'),
  StorageService: Symbol('StorageService'),
  Logger: Symbol('Logger'),
  FileSystem: Symbol('FileSystem'),
  MessageSender: Symbol('MessageSender'),
  InboundTransporter: Symbol('InboundTransporter'),
  OutboundTransporter: Symbol('OutboundTransporter'),
  TransportService: Symbol('TransportService'),
  RecipientService: Symbol('RecipientService'),
  ConnectionService: Symbol('ConnectionService'),
}

export const DID_COMM_TRANSPORT_QUEUE = 'didcomm:transport/queue'
