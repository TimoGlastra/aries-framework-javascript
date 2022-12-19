export enum OutOfBandMetadataKeys {
  ConnectionReuse = '_internal/connectionReuse',
}

export type OutOfBandMetadata = {
  [OutOfBandMetadataKeys.ConnectionReuse]: {
    reuseThreadId?: string
  }
}
