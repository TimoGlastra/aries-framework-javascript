import type { AgentDependencies } from '../../agent/AgentDependencies'
import type { Logger } from '../../logger'
import type { WalletConfig } from '../../types'
import type { Version } from './upgrades'

import { Agent } from '../../agent/Agent'
import { AriesFrameworkError } from '../../error'

import { isFirstVersionHigherThanSecond, parseVersionString, supportedUpgrades } from './upgrades'

export interface UpgradeConfig {
  walletConfig: WalletConfig
  logger?: Logger
}

export class UpgradeAssistant {
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
    return parseVersionString('0.1')
  }

  private async getNeededUpgrades() {
    const currentStorageVersion = await this.getCurrentStorageFrameworkVersion()

    // Filter upgrades. We don't want older upgrades we already applied
    // or aren't needed because the wallet was created after the upgrade script was made
    const neededUpgrades = supportedUpgrades.filter((upgrade) => {
      const toVersion = parseVersionString(upgrade.toVersion)

      // if an upgrade toVersion is higher than currentStorageVersion we want to to include the upgrade
      return isFirstVersionHigherThanSecond(toVersion, currentStorageVersion)
    })

    // The current storage version is too old to upgrade
    if (
      neededUpgrades.length > 0 &&
      isFirstVersionHigherThanSecond(parseVersionString(neededUpgrades[0].fromVersion), currentStorageVersion)
    ) {
      throw new AriesFrameworkError(
        `First fromVersion is higher than current storage version. You need to use an older version of the framework to upgrade to at least version ${neededUpgrades[0].fromVersion}`
      )
    }

    return neededUpgrades
  }

  public async upgrade() {
    this.agent.config.logger.info('Starting upgrade of agent storage')
    const neededUpgrades = await this.getNeededUpgrades()

    if (neededUpgrades.length == 0) {
      this.agent.config.logger.info('No upgrade needed. Agent storage is up to date.')
      return
    }

    const fromVersion = neededUpgrades[0].fromVersion
    const toVersion = neededUpgrades[neededUpgrades.length - 1].toVersion
    this.agent.config.logger.info(
      `Starting upgrade process. Total of ${neededUpgrades.length} update(s) will be applied to update the agent storage from version ${fromVersion} to version ${toVersion}`
    )

    for (const upgrade of neededUpgrades) {
      this.agent.config.logger.info(
        `Starting upgrade of agent storage from version ${upgrade.fromVersion} to version ${upgrade.toVersion}`
      )
      await upgrade.doUpgrade(this.agent)

      // TODO: update framework version in storage
      this.agent.config.logger.info(
        `Successfully updated agent storage from version ${upgrade.fromVersion} to version ${upgrade.toVersion}`
      )
    }
  }
}
