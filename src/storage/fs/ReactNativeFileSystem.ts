import type { FileSystem } from './FileSystem'

import RNFS from 'react-native-fs'

import { getDirFromFilePath } from '../../utils/path'

export class ReactNativeFileSystem implements FileSystem {
  public readonly baseDir = RNFS.DocumentDirectoryPath
  public readonly tmpDir = RNFS.TemporaryDirectoryPath + '/afj'

  public async exists(path: string): Promise<boolean> {
    return RNFS.exists(path)
  }

  public async write(path: string, data: string): Promise<void> {
    // Make sure parent directories exist
    await RNFS.mkdir(getDirFromFilePath(path))

    return RNFS.writeFile(path, data, 'utf8')
  }

  public async read(path: string): Promise<string> {
    return RNFS.readFile(path, 'utf8')
  }
}
