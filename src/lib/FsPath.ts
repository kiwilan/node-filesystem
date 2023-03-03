import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

export class FsPath {
  private static getRoot() {
    return process.cwd()
  }

  private static getDirname() {
    return fileURLToPath(new URL('.', import.meta.url))
  }

  /**
   * Get the absolute path of a file or directory relative to the root of the project.
   */
  public static root(path?: string): string {
    if (path)
      return join(FsPath.getRoot(), path)

    return FsPath.getRoot()
  }

  /**
   * Get the absolute path of a file or directory relative to the directory of the file that is importing this module.
   */
  public static package(path: string): string {
    return join(FsPath.getDirname(), path)
  }

  /**
   * Get the absolute path of a file or directory relative to the directory of the file that is importing this module.
   */
  public static filename(metaUrl: string): string {
    const __filename = fileURLToPath(metaUrl)

    return __filename
  }

  /**
   * Get the absolute path of a file or directory relative to the directory of the file that is importing this module.
   */
  public static dirname(metaUrl: string): string {
    const __dirname = dirname(FsPath.filename(metaUrl))

    return __dirname
  }
}
