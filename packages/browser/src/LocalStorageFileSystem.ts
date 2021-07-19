import type { FileSystem } from '@aries-framework/core'

import { AriesFrameworkError } from '@aries-framework/core'

export class LocalStorageFileSystem implements FileSystem {
  public readonly basePath = 'AFJ'

  public async exists(path: string) {
    return localStorage.getItem(path) !== null
  }

  public async write(path: string, data: string): Promise<void> {
    localStorage.setItem(path, data)
  }

  public async read(path: string): Promise<string> {
    const value = localStorage.getItem(path)

    if (!value) {
      throw new AriesFrameworkError(`Error reading from path ${path}`)
    }

    return value
  }
}
