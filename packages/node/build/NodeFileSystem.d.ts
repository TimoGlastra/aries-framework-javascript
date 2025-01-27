import type { DownloadToFileOptions, FileSystem } from '@credo-ts/core';
export declare class NodeFileSystem implements FileSystem {
    readonly dataPath: string;
    readonly cachePath: string;
    readonly tempPath: string;
    /**
     * Create new NodeFileSystem class instance.
     *
     * @param baseDataPath The base path to use for reading and writing data files used within the framework.
     * Files will be created under baseDataPath/.afj directory. If not specified, it will be set to homedir()
     * @param baseCachePath The base path to use for reading and writing cache files used within the framework.
     * Files will be created under baseCachePath/.afj directory. If not specified, it will be set to homedir()
     * @param baseTempPath The base path to use for reading and writing temporary files within the framework.
     * Files will be created under baseTempPath/.afj directory. If not specified, it will be set to tmpdir()
     */
    constructor(options?: {
        baseDataPath?: string;
        baseCachePath?: string;
        baseTempPath?: string;
    });
    exists(path: string): Promise<boolean>;
    createDirectory(path: string): Promise<void>;
    copyFile(sourcePath: string, destinationPath: string): Promise<void>;
    write(path: string, data: string): Promise<void>;
    read(path: string): Promise<string>;
    delete(path: string): Promise<void>;
    downloadToFile(url: string, path: string, options: DownloadToFileOptions): Promise<void>;
}
