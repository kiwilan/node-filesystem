import md5 from 'md5'
import mime from 'mime-types'
import type { GlobOptionsWithFileTypesUnset } from 'glob'
import { glob } from 'glob'
import type { ReplaceInFileBulk } from '../types'
import type { FileContent } from './FsFileNative'
import { FsFileNative } from './FsFileNative'
import { FsFileItem } from './FsFileItem'
import { FsPath } from './FsPath'

export class FsFile {
  /**
   * Determine if a file or directory exists.
   */
  public static async exists(path: string): Promise<boolean> {
    return await FsFileNative.exists(path)
  }

  /**
   * Get the contents of a file (not promise).
   */
  public static getSync(path: string): string {
    return FsFileNative.readFileSync(path)
  }

  /**
   * Get the contents of a file.
   */
  public static async get(path: string): Promise<string> {
    return await FsFileNative.readFile(path)
  }

  /**
   * Get the contents of a file one line at a time.
   */
  public static async lines(path: string): Promise<string[] | false> {
    const file = await FsFileNative.readFile(path)
    if (!file)
      return false
    const lines = file.split('\n')

    return lines
  }

  /**
   * Get the hash of the file at the given path.
   */
  public static async hash(path: string): Promise<string | false> {
    const content = await this.get(path)
    if (!content)
      return false

    return md5(content)
  }

  /**
   * Write the contents of a file.
   */
  public static async put(path: string, contents: FileContent): Promise<boolean> {
    const created = await FsFileNative.writeFile(path, contents)
    return typeof created === 'string'
  }

  // /**
  //  * Write the contents of a file, replacing it atomically if it already exists.
  //  */
  // public static async replace(path: string, content: string, mode: number | undefined): Promise<void> {
  // }

  // public static async replaceInFile(search: string[] | string, replace: string[] | string, path: string): Promise<void> {
  // }

  /**
   * Replace a given string within a given file.
   */
  public static async replaceInFile(path: string, str: string, replace: string): Promise<void> {
    const isExists = await this.exists(path)
    const stringExists = await this.stringExistsInFile(path, str)

    if (!isExists)
      console.warn(`promise replaceInFile ${path} not found`)

    if (!stringExists)
      console.warn(`promise replaceInFile ${str} not found`)

    const data = await this.get(path)
    const result = data.replace(str, replace)
    await this.put(path, result)
  }

  /**
   * Replace a given string within a given file.
   */
  public static async replaceInFileBulk(fromPath: string, toPath: string, replace: ReplaceInFileBulk[]): Promise<void> {
    if (!await this.exists(fromPath))
      console.warn(`replaceInFile ${fromPath} not found`)

    const data = await this.get(fromPath)

    let current = data
    replace.forEach((el) => {
      current = current.replaceAll(el.from, el.to)
    })

    await this.put(toPath, current)
  }

  /**
   * Prepend to a file.
   */
  public static async prepend(path: string, data: string): Promise<boolean> {
    return await FsFileNative.prependFile(path, data)
  }

  /**
   * Append to a file.
   */
  public static async append(path: string, data: string): Promise<boolean> {
    return await FsFileNative.appendFile(path, data)
  }

  /**
   * Set UNIX mode of a file or directory.
   */
  public static async chmod(path: string, mode = 777): Promise<boolean> {
    return await FsFileNative.chmod(path, mode)
  }

  /**
   * Delete the file at a given path.
   */
  public static async delete(paths: string | string[]): Promise<boolean> {
    return await FsFileNative.rm(paths)
  }

  /**
   * Move a file to a new location.
   */
  public static async move(path: string, target: string): Promise<boolean> {
    return await FsFileNative.rename(path, target)
  }

  /**
   * Copy a file to a new location.
   */
  public static async copy(path: string, target: string): Promise<boolean> {
    return await FsFileNative.copyFile(path, target)
  }

  /**
   * Create a symlink to the target file or directory. On Windows, a hard link is created if the target is a file.
   */
  public static async link(target: string, link: string): Promise<boolean> {
    return await FsFileNative.symlink(target, link)
  }

  // /**
  //  * Create a relative symlink to the target file or directory.
  //  */
  // public static async relativeLink(target: string, link: string): Promise<void> {
  // }

  /**
   * Extract the file name from a file path.
   */
  public static filename(path: string, withExtension = true): string {
    const current = FsFileNative.basename(path)
    if (!withExtension)
      return current

    const removeExt = current.split('.')
    removeExt.pop()

    return removeExt.join('.')
  }

  /**
   * Extract the parent directory from a file path.
   */
  public static dirname(path: string): string {
    const current = FsFileNative.basename(path)
    return FsFileNative.basename(current)
  }

  /**
   * Extract the file extension from a file path.
   */
  public static extension(path: string): string | false {
    const current = FsFileNative.basename(path)
    const ext = current.split('.')
    return ext.pop() || false
  }

  /**
   * Get the file type of a given file.
   */
  public static async type(path: string): Promise<string | false> {
    return mime.contentType(path)
  }

  /**
   * Get the mime-type of a given file.
   */
  public static async mimeType(path: string): Promise<string | false> {
    return mime.lookup(path)
  }

  /**
   * Get the file size of a given file.
   */
  public static async size(path: string, humanReadable = false): Promise<number | string> {
    if (humanReadable)
      return await FsFileNative.bytesHuman(path)

    const stats = await FsFileNative.stat(path)
    return stats?.size || 0
  }

  /**
   * Get the file's last modification time.
   */
  public static async lastModified(path: string): Promise<Date | undefined> {
    const stats = await FsFileNative.stat(path)
    if (!stats)
      return undefined

    return stats.mtime
  }

  /**
   * Determine if the given path is a directory.
   */
  public static async isDirectory(directory: string): Promise<boolean> {
    const stats = await FsFileNative.stat(directory)
    return stats?.isDirectory() || false
  }

  /**
   * Determine if the given path is a directory that does not contain any other files or directories.
   */
  public static async isEmptyDirectory(directory: string, ignoreDotFiles = false): Promise<boolean> {
    const files = await FsFileNative.readdir(directory)

    if (!files)
      return false

    if (files.length === 0)
      return true

    if (ignoreDotFiles) {
      const filtered = files.filter((file) => {
        return !file.startsWith('.')
      })

      return filtered.length === 0
    }

    return false
  }

  /**
   * Determine if the given path is readable.
   */
  public static async isReadable(path: string): Promise<boolean> {
    return await FsFileNative.access(path, { isReadable: true })
  }

  /**
   * Determine if the given path is writable.
   */
  public static async isWritable(path: string): Promise<boolean> {
    return await FsFileNative.access(path, { isReadable: true, isWritable: true })
  }

  /**
   * Determine if two files are the same by comparing their hashes.
   */
  public static async hasSameHash(firstFile: string, secondFile: string): Promise<boolean> {
    const firstHash = await this.hash(firstFile)
    const secondHash = await this.hash(secondFile)

    return firstHash === secondHash
  }

  /**
   * Determine if the given path is a file.
   */
  public static async isFile(file: string): Promise<boolean> {
    const stats = await FsFileNative.stat(file)
    return stats?.isFile() || false
  }

  /**
   * Find path names matching a given pattern.
   */
  public static async glob(pattern: string | string[], options?: GlobOptionsWithFileTypesUnset): Promise<string[]> {
    return await glob(pattern, options)
  }

  /**
   * Get an array of all files in a directory.
   */
  public static async files(directory: string, hidden = false): Promise<FsFileItem[]> {
    const files: FsFileItem[] = []

    const res = await FsFileNative.readdir(directory)
    if (!res)
      throw new Error(`Could not read directory: ${directory}`)

    for (const item of res) {
      const file = await FsFileItem.makeFromPath(item)
      if (!hidden && file.name.startsWith('.'))
        continue

      files.push(file)
    }

    return files
  }

  /**
   * Get all of the files from the given directory (recursive).
   */
  public static async allFiles(directory: string, hidden = false): Promise<FsFileItem[]> {
    const list = await FsFileNative.readdir(directory, true)
    const files = await Promise.all(list.map(async (item) => {
      const file = await FsFileItem.makeFromPath(item)
      if (!hidden && !file.isHidden)
        return file
      else
        return file
    }))

    return files
  }

  /**
   * Filter FileItem to get only files with
   */
  public static async allFilesGlob({
    directory,
    hidden = false,
    extensions = [],
  }: {
    directory: string
    hidden?: boolean
    extensions: string | string[]
  }): Promise<FsFileItem[]> {
    const files = await this.allFiles(directory, hidden)

    if (typeof extensions === 'string')
      extensions = [extensions]

    const list = files.filter((file) => {
      if (file.extension)
        return extensions.includes(file.extension)

      return false
    })

    return list
  }

  /**
   * Get all of the directories within a given directory.
   */
  public static async directories(directory: string): Promise<string[]> {
    const files = await this.files(directory)
    if (!files)
      return []

    return files.filter((file) => {
      return file.isDirectory
    }).map((file) => {
      return file.path
    })
  }

  /**
   * Ensure a directory exists.
   */
  public static async ensureDirectoryExists(path: string): Promise<boolean> {
    if (await this.isReadable(path))
      return true

    return false
  }

  /**
   * Create a directory if not exists.
   */
  public static async makeDirectory(path: string, recursive = false): Promise<boolean> {
    // path: string, mode = 755, recursive = false, force = false
    const isExists = await this.ensureDirectoryExists(path)
    if (!isExists)
      return await FsFileNative.mkdir(path, recursive)

    return false
  }

  /**
   * Move a directory.
   */
  public static async moveDirectory(from: string, to: string): Promise<boolean> {
    return await FsFileNative.rename(from, to)
  }

  /**
   * Copy a directory from one location to another.
   */
  public static async copyDirectory(directory: string, destination: string): Promise<boolean> {
    return await FsFileNative.copyDirectoryRecursive(directory, destination)
  }

  /**
   * Recursively delete a directory.
   *
   * The directory itself may be optionally preserved.
   */
  public static async deleteDirectory(directory: string): Promise<boolean> {
    return await FsFileNative.rm(directory)
  }

  /**
   * Remove all of the directories within a given directory.
   */
  public static async deleteDirectories(directory: string): Promise<boolean> {
    const dirs = await this.directories(directory)
    if (!dirs)
      return false

    for (const dir of dirs)
      await this.deleteDirectory(dir)

    return true
  }

  /**
   * Empty the specified directory of all files and folders.
   */
  public static async cleanDirectory(directory: string, except: string[] = []): Promise<boolean> {
    const files = await FsFileNative.readdir(directory)
    if (!files)
      return false

    for (const file of files) {
      const curPath = `${directory}/${file}`
      if (except.includes(file))
        continue

      await FsFileNative.rm(curPath)
    }

    return true
  }

  /**
   * Additional methods
   */

  /**
   * Shuffle an array.
   */
  public static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }

    return array
  }

  public static async stringExistsInFile(path: string, str: string): Promise<boolean> {
    const data = (await this.get(path)).toString()
    if (!data.includes(str))
      return false

    return true
  }

  public static async addToGitIgnore(ignore: string, path = '.gitignore'): Promise<void> {
    const root = FsPath.root()
    ignore = ignore.replace(root, '')

    const addToFile = async (path: string, content: string): Promise<void> => {
      const inputData = await this.get(path)
      if (!inputData.includes(content))
        await FsFileNative.appendFile(path, content)
    }

    const ignoreFiles = async () => {
      if (!await this.exists(path))
        await this.put(path, '')

      await addToFile(path, `\n${ignore}\n`)
    }

    await ignoreFiles()
  }
}
