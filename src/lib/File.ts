import type { Dirent } from 'fs'
import md5 from 'md5'
import mime from 'mime-types'
import type { GlobOptionsWithFileTypesUnset } from 'glob'
import glob from 'glob'
import { FileItem } from './FileItem'
import type { FileContent } from './FileNative'
import { FileNative } from './FileNative'

export class File {
  /**
   * Determine if a file or directory exists.
   */
  public static async exists(path: string): Promise<boolean> {
    const file = await FileNative.readFile(path)
    return typeof file === 'string'
  }

  /**
   * Get the contents of a file.
   */
  public static async get(path: string): Promise<string | false> {
    return await FileNative.readFile(path)
  }

  /**
   * Get the contents of a file one line at a time.
   */
  public static async lines(path: string): Promise<string[] | false> {
    const file = await FileNative.readFile(path)
    if (!file)
      return false
    const lines = file.split('\n')

    return lines
  }

  /**
   * Get the hash of the file at the given path.
   */
  public static async hash(path: string): Promise<string | false> {
    const content = await File.get(path)
    if (!content)
      return false

    return md5(content)
  }

  /**
   * Write the contents of a file.
   */
  public static async put(path: string, contents: FileContent): Promise<boolean> {
    const created = await FileNative.writeFile(path, contents)
    return typeof created === 'string'
  }

  // /**
  //  * Write the contents of a file, replacing it atomically if it already exists.
  //  */
  // public static async replace(path: string, content: string, mode: number | undefined): Promise<void> {
  // }

  // /**
  //  * Replace a given string within a given file.
  //  */
  // public static async replaceInFile(search: string[] | string, replace: string[] | string, path: string): Promise<void> {
  // }

  // /**
  //  * Prepend to a file.
  //  */
  // public static async prepend(path: string, data: string): Promise<number> {
  //   return 0
  // }

  // /**
  //  * Append to a file.
  //  */
  // public static async append(path: string, data: string): Promise<number> {
  //   return 0
  // }

  /**
   * Set UNIX mode of a file or directory.
   */
  public static async chmod(path: string, mode = 777): Promise<boolean> {
    return await FileNative.chmod(path, mode)
  }

  /**
   * Delete the file at a given path.
   */
  public static async delete(paths: string | string[]): Promise<boolean> {
    return await FileNative.rm(paths)
  }

  /**
   * Move a file to a new location.
   */
  public static async move(path: string, target: string): Promise<boolean> {
    return await FileNative.rename(path, target)
  }

  /**
   * Copy a file to a new location.
   */
  public static async copy(path: string, target: string): Promise<boolean> {
    return await FileNative.copyFile(path, target)
  }

  /**
   * Create a symlink to the target file or directory. On Windows, a hard link is created if the target is a file.
   */
  public static async link(target: string, link: string): Promise<boolean> {
    return await FileNative.symlink(target, link)
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
    const current = FileNative.basename(path)
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
    const current = FileNative.basename(path)
    return FileNative.basename(current)
  }

  /**
   * Extract the file extension from a file path.
   */
  public static extension(path: string): string | false {
    const current = FileNative.basename(path)
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
  public static async size(path: string, humanReadble = false): Promise<number | string> {
    if (humanReadble)
      return await File.bytesHuman(path)

    const stats = await FileNative.stat(path)
    return stats.size
  }

  /**
   * Get the file's last modification time.
   */
  public static async lastModified(path: string): Promise<Date> {
    const stats = await FileNative.stat(path)
    return stats.mtime
  }

  /**
   * Determine if the given path is a directory.
   */
  public static async isDirectory(directory: string): Promise<boolean> {
    const stats = await FileNative.stat(directory)
    return stats.isDirectory()
  }

  /**
   * Determine if the given path is a directory that does not contain any other files or directories.
   */
  public static async isEmptyDirectory(directory: string, ignoreDotFiles = false): Promise<boolean> {
    const files = await FileNative.readdir(directory)

    if (!files)
      return false

    if (files.length === 0)
      return true

    if (ignoreDotFiles) {
      const filtered = files.filter((file) => {
        return !file.name.startsWith('.')
      })

      return filtered.length === 0
    }

    return false
  }

  /**
   * Determine if the given path is readable.
   */
  public static async isReadable(path: string): Promise<boolean> {
    return await FileNative.access(path, { isReadable: true })
  }

  /**
   * Determine if the given path is writable.
   */
  public static async isWritable(path: string): Promise<boolean> {
    return await FileNative.access(path, { isReadable: true, isWritable: true })
  }

  /**
   * Determine if two files are the same by comparing their hashes.
   */
  public static async hasSameHash(firstFile: string, secondFile: string): Promise<boolean> {
    const firstHash = await File.hash(firstFile)
    const secondHash = await File.hash(secondFile)

    return firstHash === secondHash
  }

  /**
   * Determine if the given path is a file.
   */
  public static async isFile(file: string): Promise<boolean> {
    const stats = await FileNative.stat(file)
    return stats.isFile()
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
  public static async files(directory: string, hidden = false): Promise<FileItem[]> {
    const files: FileItem[] = []

    const res = await FileNative.readdir(directory)
    if (!res)
      throw new Error(`Could not read directory: ${directory}`)

    for (const dirent of res) {
      const file = FileItem.makeFromDirent(dirent)
      if (!hidden && file.name.startsWith('.'))
        continue

      files.push(file)
    }

    return files
  }

  /**
   * Get all of the files from the given directory (recursive).
   */
  public static async allFiles(directory: string, hidden = false): Promise<FileItem[]> {
    const res = await FileNative.readdir(directory, true)
    if (!res)
      throw new Error(`Could not read directory: ${directory}`)

    const list = Array.prototype.concat(...res) as Dirent[]

    const files = list.map((dirent) => {
      const file = FileItem.makeFromDirent(dirent)
      if (!hidden && !file.isHidden)
        return file
      else
        return file
    })

    return files
  }

  /**
   * Get all of the directories within a given directory.
   */
  public static async directories(directory: string): Promise<string[]> {
    const files = await File.files(directory)
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
    const isExists = await File.ensureDirectoryExists(path)
    if (!isExists)
      return await FileNative.mkdir(path, recursive)

    return false
  }

  /**
   * Move a directory.
   */
  public static async moveDirectory(from: string, to: string): Promise<boolean> {
    return await FileNative.rename(from, to)
  }

  /**
   * Copy a directory from one location to another.
   */
  public static async copyDirectory(directory: string, destination: string): Promise<boolean> {
    return await FileNative.copyDirectoryRecursive(directory, destination)
  }

  /**
   * Recursively delete a directory.
   *
   * The directory itself may be optionally preserved.
   */
  public static async deleteDirectory(directory: string): Promise<boolean> {
    return await FileNative.rm(directory)
  }

  /**
   * Remove all of the directories within a given directory.
   */
  public static async deleteDirectories(directory: string): Promise<boolean> {
    const dirs = await File.directories(directory)
    if (!dirs)
      return false

    for (const dir of dirs)
      await File.deleteDirectory(dir)

    return true
  }

  /**
   * Empty the specified directory of all files and folders.
   */
  public static async cleanDirectory(directory: string): Promise<boolean> {
    const files = await FileNative.readdir(directory)
    if (!files)
      return false

    for (const file of files) {
      const curPath = `${directory}/${file.name}`
      await FileNative.rm(curPath)
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

  /**
   * Get the size of a file in human readable format.
   */
  private static async bytesHuman(path: string): Promise<string> {
    const stats = await FileNative.stat(path)
    const bytes = stats.size
    const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024))
    const res = (bytes / 1024 ** i).toFixed(2)
    return `${Number(res) * 1} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`
  }
}
