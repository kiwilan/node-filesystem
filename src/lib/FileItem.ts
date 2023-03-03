import type { Dirent } from 'fs'

interface FileItemOpts {
  name: string
  path: string
  pathAbsolute?: string
  isDirectory?: boolean
  isFile?: boolean
  isSymbolicLink?: boolean
  isHidden?: boolean
  lastModified?: number
  size?: number
  sizeHuman?: string
}

export class FileItem {
  protected constructor(
    public name: string,
    public path: string,
    public isDirectory: boolean,
    public isFile: boolean,
    public isSymbolicLink: boolean,
    public isHidden: boolean,
    public lastModified?: number,
    public size?: number,
    public sizeHuman?: string,
  ) {}

  public static make(file: FileItemOpts): FileItem {
    return new FileItem(
      file.name,
      file.path,
      file.isDirectory || false,
      file.isFile || false,
      file.isSymbolicLink || false,
      file.isHidden || false,
      file.lastModified,
      file.size,
      file.sizeHuman,
    )
  }

  public static makeFromDirent(dirent: Dirent): FileItem {
    return FileItem.make({
      name: dirent.name,
      path: dirent.name,
      isDirectory: dirent.isDirectory(),
      isFile: dirent.isFile(),
      isSymbolicLink: dirent.isSymbolicLink(),
      isHidden: dirent.name.startsWith('.'),
    })
  }

  // public static makeFromArray(path: string): FileItem[] {
  //   const files: FileItem[] = []

  //   return files
  // }
}
