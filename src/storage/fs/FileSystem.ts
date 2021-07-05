export interface FileSystem {
  readonly baseDir: string
  readonly tmpDir: string

  exists(path: string): Promise<boolean>
  write(path: string, data: string): Promise<void>
  read(path: string): Promise<string>
}
