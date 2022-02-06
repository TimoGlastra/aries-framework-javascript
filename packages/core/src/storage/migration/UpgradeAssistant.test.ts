import type { AgentDependencies } from '../../agent/AgentDependencies'
import type { Logger } from '../../logger'
import type { WalletConfig } from '../../types'

import { Agent } from '../../agent/Agent'
import { AriesFrameworkError } from '../../error'

import { upgradeV010ToV020 } from './0.2.0'

export interface UpgradeConfig {
  walletConfig: WalletConfig
  logger?: Logger
}

const upgrades: Array<{
  fromVersion: VersionString
  toVersion: VersionString
  upgradeMethod: (agent: Agent) => Promise<void>
}> = [
  {
    fromVersion: '0.1',
    toVersion: '0.2',
    upgradeMethod: upgradeV010ToV020,
  },
  // 0.2.0 -> 0.5.0 no upgrades needed
  {
    fromVersion: '0.2',
    toVersion: '0.6',
    upgradeMethod: upgradeV010ToV020,
  },
  {
    fromVersion: '0.6',
    toVersion: '1.0',
    upgradeMethod: upgradeV010ToV020,
  },
  // 1.0.0 -> 1.2.0 no updates needed
]
type VersionString = `${number}.${number}`
type MajorVersion = number
type MinorVersion = number
type Version = [MajorVersion, MinorVersion]
const parse = (version: VersionString): Version => {
  const [major, minor] = version.split('.')

  return [Number(major), Number(minor)]
}

function isFirstHigherThanSecond(first: Version, second: Version) {
  return first[0] > second[0] || (first[0] == second[0] && first[1] > second[1])
}

class UpgradeAssistant {
  private agent: Agent

  public constructor(upgradeConfig: UpgradeConfig, agentDependencies: AgentDependencies) {
    this.agent = new Agent(
      {
        label: 'Upgrade Assistant',
        walletConfig: upgradeConfig.walletConfig,
        logger: upgradeConfig.logger,
      },
      agentDependencies
    )
  }

  public async initialize() {
    if (this.agent.isInitialized) {
      throw new AriesFrameworkError('Agent already initialized')
    }

    await this.agent.initialize()
  }

  public async isUpToDate() {
    try {
      const neededUpgrades = await this.getNeededUpgrades()

      return neededUpgrades.length === 0
    } catch (error) {
      return false
    }
  }

  public async getCurrentStorageFrameworkVersion(): Promise<Version> {
    // TODO: retrieve the storage framework version from storage
    return parse('0.1')
  }

  private async getNeededUpgrades() {
    const currentStorageVersion = await this.getCurrentStorageFrameworkVersion()

    const neededUpgrades = upgrades.filter((upgrade) => {
      const toVersion = parse(upgrade.toVersion)

      // if an upgrade toVersion is higher than currentStorageVersion we want to to include the upgrade
      return isFirstHigherThanSecond(toVersion, currentStorageVersion)
    })

    // The current storage version is too old to upgrade
    if (
      neededUpgrades.length > 0 &&
      isFirstHigherThanSecond(parse(neededUpgrades[0].fromVersion), currentStorageVersion)
    ) {
      throw new AriesFrameworkError(
        `First fromVersion is higher than current storage version. You need to use an older version of the framework to upgrade to at least version ${neededUpgrades[0].fromVersion}`
      )
    }

    return neededUpgrades
  }

  public async upgrade() {
    const neededUpgrades = await this.getNeededUpgrades()

    for (const upgrade of neededUpgrades) {
      await upgrade.upgradeMethod(this.agent)

      // TODO: update framework version in storage
    }
  }
}
