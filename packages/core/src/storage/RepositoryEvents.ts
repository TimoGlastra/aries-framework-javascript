import type { BaseEvent } from '../agent/Events'
import type { BaseRecord } from './BaseRecord'

export enum RepositoryEventTypes {
  RecordSaved = 'RecordSaved',
  RecordUpdated = 'RecordUpdated',
  RecordDeleted = 'RecordDeleted',
}

// biome-ignore lint/suspicious/noExplicitAny:
export interface RecordSavedEvent<T extends BaseRecord<any, any, any>> extends BaseEvent {
  type: typeof RepositoryEventTypes.RecordSaved
  payload: {
    record: T
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
export interface RecordUpdatedEvent<T extends BaseRecord<any, any, any>> extends BaseEvent {
  type: typeof RepositoryEventTypes.RecordUpdated
  payload: {
    record: T
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
export interface RecordDeletedEvent<T extends BaseRecord<any, any, any>> extends BaseEvent {
  type: typeof RepositoryEventTypes.RecordDeleted
  payload: {
    record: T | { id: string; type: string }
  }
}
