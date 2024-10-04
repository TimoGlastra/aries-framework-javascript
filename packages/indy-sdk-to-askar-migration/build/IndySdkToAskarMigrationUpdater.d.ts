import type { Agent } from '@credo-ts/core';
/**
 *
 * Migration class to move a wallet form the indy-sdk structure to the new
 * askar wallet structure.
 *
 * Right now, this is ONLY supported within React Native environments AND only sqlite.
 *
 * The reason it only works within React Native is that we ONLY update the
 * keys, masterSecret and credentials for now. If you have an agent in Node.JS
 * where it only contains these records, it may be used but we cannot
 * guarantee a successful migration.
 *
 */
export declare class IndySdkToAskarMigrationUpdater {
    private store?;
    private walletConfig;
    private defaultLinkSecretId;
    private agent;
    private dbPath;
    private fs;
    private constructor();
    static initialize({ dbPath, agent, defaultLinkSecretId, }: {
        dbPath: string;
        agent: Agent;
        defaultLinkSecretId?: string;
    }): Promise<IndySdkToAskarMigrationUpdater>;
    /**
     * This function migrates the old database to the new structure.
     *
     * This doubles checks some fields as later it might be possible to run this function
     */
    private migrate;
    private assertDestinationsAreFree;
    /**
     * Location of the new wallet
     */
    get newWalletPath(): string;
    /**
     * Temporary backup location of the pre-migrated script
     */
    private get backupFile();
    private copyDatabaseWithOptionalWal;
    /**
     * Backup the database file. This function makes sure that the the indy-sdk
     * database file is backed up within our temporary directory path. If some
     * error occurs, `this.revertDatabase()` will be called to revert the backup.
     */
    private backupDatabase;
    private cleanBackup;
    /**
     * Move the migrated and updated database file to the new location according
     * to the `FileSystem.dataPath`.
     */
    private moveToNewLocation;
    /**
     * Function that updates the values from an indy-sdk structure to the new askar structure.
     *
     * > NOTE: It is very important that this script is ran before the 0.3.x to
     *         0.4.x migration script. This can easily be done by calling this when you
     *         upgrade, before you initialize the agent with `autoUpdateStorageOnStartup:
     *         true`.
     *
     * - Assert that the paths that will be used are free
     * - Create a backup of the database
     * - Migrate the database to askar structure
     * - Update the Keys
     * - Update the Master Secret (Link Secret)
     * - Update the credentials
     * If any of those failed:
     *   - Revert the database
     * - Clear the backup from the temporary directory
     */
    update(): Promise<void>;
    private updateKeys;
    private updateCredentialDefinitions;
    private updateMasterSecret;
    private updateCredentials;
}
