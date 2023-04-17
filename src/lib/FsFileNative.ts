import type { Stats } from 'node:fs'
import { constants, readFileSync as readFileNodeSync } from 'node:fs'
import { access, appendFile, chmod, mkdir, readFile, readdir, rename, rm, stat, symlink, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

export type FileContent = string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView>

export class FsFileNative {
  public static async exists(path: string): Promise<boolean> {
    const stat = await this.stat(path)
    const isDir = stat?.isDirectory()
    try {
      if (isDir)
        await access(path, constants.R_OK)
      else
        await readFile(path)
      return true
    }
    catch (err) {
      return false
    }
  }

  public static readFileSync(path: string): string {
    return readFileNodeSync(path, { encoding: 'utf8' })
  }

  public static async readFile(path: string): Promise<string> {
    try {
      const data = await readFile(path, { encoding: 'utf8' })
      return data
    }
    catch (err) {
      console.error(err)
      throw new Error(`readFile error: ${path}`)
    }
  }

  public static async writeFile(path: string, content: FileContent): Promise<string | false> {
    try {
      if (path.includes('/')) {
        const targetDir = path.split('/').slice(0, -1).join('/')
        await mkdir(targetDir, { recursive: true })
      }
      await writeFile(path, content, { encoding: 'utf8', flag: 'w' })

      return path
    }
    catch (error) {
      console.warn(error)
      throw new Error(`writeFile error: ${path}`)
    }
  }

  public static async rm(path: string | string[]): Promise<boolean> {
    try {
      if (Array.isArray(path)) {
        await Promise.all(path.map(async (p) => {
          await rm(p, { recursive: true, force: true })
        }))
      }
      else {
        await rm(path, { recursive: true, force: true })
      }

      return true
    }
    catch (error) {
      console.warn(error)
      throw new Error(`rm error: ${path}`)
    }
  }

  public static async readdir(path: string, recursive = false): Promise<string[]> {
    try {
      if (recursive) {
        const filesInDirectory = await readdir(path)
        const tempFiles = await Promise.all(filesInDirectory.map(async (file) => {
          const absolute = join(path, file)
          const stats = await stat(absolute)
          if (stats.isDirectory())
            return FsFileNative.readdir(absolute, recursive)
          else
            return absolute
        }))

        if (!tempFiles)
          return []

        return Array.prototype.concat(...tempFiles)
      }
      else {
        return await readdir(path)
      }
    }
    catch (error) {
      console.warn(error)
      throw new Error(`readdir error: ${path}`)
    }
  }

  public static async stat(path: string): Promise<Stats | undefined> {
    try {
      return await stat(path)
    }
    catch (error) {
      return undefined
    }
  }

  public static basename(path: string): string {
    return basename(path)
  }

  public static async mkdir(path: string, recursive = true): Promise<boolean> {
    try {
      await mkdir(path, { recursive })
      return true
    }
    catch (error) {
      console.error(error)
      return false
    }
  }

  public static async rename(from: string, to: string): Promise<boolean> {
    try {
      await rename(from, to)
      return true
    }
    catch (error) {
      console.error(error)
      return false
    }
  }

  // public static async copyFile(source: string, target: string): Promise<boolean> {
  //   try {
  //     await copyFile(source, target)
  //     return true
  //   }
  //   catch (error) {
  //     console.error(error)
  //     return false
  //   }
  // }

  public static async copyFile(source: string, target: string): Promise<boolean> {
    let targetFile = target

    const sourceContent = await this.readFile(source)
    const isExists = typeof sourceContent === 'string'

    // If target is a directory, a new file with the same name will be created
    if (!isExists)
      throw new Error(`Copy file, source file not found: ${source}`)

    const stat = await this.stat(target)
    if (stat?.isDirectory())
      targetFile = join(target, basename(source))

    const success = await this.writeFile(targetFile, sourceContent)

    return !!success
  }

  public static async copyDirectoryRecursive(source: string, target: string): Promise<boolean> {
    // Check if folder needs to be created or integrated
    const targetFolder = join(target, basename(source))

    const sourceContent = await this.readFile(source)
    const isExists = typeof sourceContent === 'string'

    if (!isExists)
      await mkdir(targetFolder)

    const statSource = await this.stat(source)
    if (!statSource?.isDirectory())
      throw new Error(`Copy folder, source folder not found: ${source}`)

    const list = await this.readdir(source)
    await Promise.all(list.map(async (file) => {
      const curSource = join(source, file)
      const statCurrent = await this.stat(curSource)
      if (statCurrent?.isDirectory())
        this.copyDirectoryRecursive(curSource, targetFolder)
      else
        this.copyFile(curSource, targetFolder)
    }))

    return true
  }

  public static async appendFile(path: string, content: string | Uint8Array): Promise<boolean> {
    try {
      await appendFile(path, content, { encoding: 'utf8' })
      return true
    }
    catch (error) {
      console.error(error)
      throw new Error(`appendFile error: ${path}`)
    }
  }

  public static async prependFile(path: string, content: string | Uint8Array): Promise<boolean> {
    try {
      const fileContent = await this.readFile(path)
      const newContent = `${content}${fileContent}`

      await this.writeFile(path, newContent)
      return true
    }
    catch (error) {
      console.error(error)
      throw new Error(`prependFile error: ${path}`)
    }
  }

  public static async chmod(path: string, mode = 777): Promise<boolean> {
    try {
      await chmod(path, mode)
      return true
    }
    catch (error) {
      console.error(error)
      return false
    }
  }

  public static async symlink(source: string, target: string): Promise<boolean> {
    try {
      await symlink(source, target)
      return true
    }
    catch (error) {
      console.error(error)
      return false
    }
  }

  public static async access(path: string, {
    isReadable = true,
    isWritable = false,
  }): Promise<boolean> {
    const flags: number[] = []
    if (isReadable)
      flags.push(constants.R_OK)
    if (isWritable)
      flags.push(constants.W_OK)

    try {
      await access(path, ...flags)
      return true
    }
    catch (error) {
      console.error(error)
      return false
    }
  }

  /**
   * Get the size of a file in human readable format.
   */
  public static async bytesHuman(path: string): Promise<string> {
    const stats = await FsFileNative.stat(path)
    if (!stats)
      return '0 B'
    const bytes = stats.size
    const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024))
    const res = (bytes / 1024 ** i).toFixed(2)
    return `${Number(res) * 1} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`
  }
}
