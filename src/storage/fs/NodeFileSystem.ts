import type { FileSystem } from './FileSystem'

import { promises } from 'fs'
import { tmpdir } from 'os'
import { dirname, join } from 'path'
import { cwd } from 'process'

const { access, readFile, writeFile } = promises

export class NodeFileSystem implements FileSystem {
  public readonly baseDir = join(cwd(), 'afj')
  public readonly tmpDir = tmpdir()

  public async exists(path: string) {
    try {
      await access(path)
      return true
    } catch {
      return false
    }
  }

  public async write(path: string, data: string): Promise<void> {
    // Make sure parent directories exist
    await promises.mkdir(dirname(path), { recursive: true })

    return writeFile(path, data, { encoding: 'utf-8' })
  }

  public async read(path: string): Promise<string> {
    return readFile(path, { encoding: 'utf-8' })
  }
}
