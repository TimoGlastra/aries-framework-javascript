import type { Agent } from '../../agent/Agent'

import { upgradeV010ToV020 } from './0.2'

export const supportedUpgrades: Upgrade[] = [
  {
    fromVersion: '0.1',
    toVersion: '0.2',
    doUpgrade: upgradeV010ToV020,
  },
]

export function parseVersionString(version: VersionString): Version {
  const [major, minor] = version.split('.')

  return [Number(major), Number(minor)]
}

export function isFirstVersionHigherThanSecond(first: Version, second: Version) {
  return first[0] > second[0] || (first[0] == second[0] && first[1] > second[1])
}

export type VersionString = `${number}.${number}`
export type MajorVersion = number
export type MinorVersion = number
export type Version = [MajorVersion, MinorVersion]

export interface Upgrade {
  fromVersion: VersionString
  toVersion: VersionString
  doUpgrade: (agent: Agent) => Promise<void>
}
