import type { Dirent, Stats } from 'fs'
import { access, chmod, constants, mkdir, readFile, readdir, rename, rm, stat, symlink, writeFile } from 'fs/promises'
import { basename, join, resolve } from 'path'

export type FileContent = string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView>

export class FileNative {
  public static async readFile(path: string): Promise<string | false> {
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
        Promise.all(path.map(async (p) => {
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

  public static async readdir(path: string, recursive = false): Promise<Dirent[]> {
    try {
      if (recursive) {
        const paths = await readdir(path, { withFileTypes: true })
        const tempFiles = await Promise.all(paths.map((dirent) => {
          const res = resolve(path, dirent.name)
          if (dirent.isDirectory())
            return FileNative.readdir(res, recursive)
          else
            return dirent
        }))

        if (!tempFiles)
          return []

        return Array.prototype.concat(...tempFiles)
      }
      else {
        return await readdir(path, { withFileTypes: true })
      }
    }
    catch (error) {
      console.warn(error)
      throw new Error(`readdir error: ${path}`)
    }
  }

  public static async stat(path: string): Promise<Stats> {
    return await stat(path)
  }

  public static basename(path: string): string {
    return basename(path)
  }

  public static async mkdir(path: string, recursive = true): Promise<boolean> {
    try {
      const __dirname = resolve()
      path = path.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '')
      await mkdir(resolve(__dirname, path), { recursive })
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
    if (stat.isDirectory())
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
    if (!statSource.isDirectory())
      throw new Error(`Copy folder, source folder not found: ${source}`)

    const list = await this.readdir(source)
    Promise.all(list.map(async (file) => {
      const curSource = join(source, file.name)
      const statCurrent = await this.stat(curSource)
      if (statCurrent.isDirectory())
        this.copyDirectoryRecursive(curSource, targetFolder)
      else
        this.copyFile(curSource, targetFolder)
    }))

    return true
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
      await symlink(target, target)
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
}
