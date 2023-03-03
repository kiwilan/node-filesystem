import { FsFileNative } from './FsFileNative'
import { FsPath } from './FsPath'

interface FileItemOpts {
  name: string
  filename: string
  path: string
  pathRelative: string
  extension?: string
  isDirectory?: boolean
  isFile?: boolean
  isSymbolicLink?: boolean
  isHidden?: boolean
  lastModified?: number
  size?: number
  sizeHuman?: string
}

export class FsFileItem {
  protected constructor(
    public name: string,
    public filename: string,
    public path: string,
    public pathRelative: string,
    public extension: string | undefined,
    public isDirectory: boolean,
    public isFile: boolean,
    public isSymbolicLink: boolean,
    public isHidden: boolean,
    public lastModified?: number,
    public size?: number,
    public sizeHuman?: string,
  ) {}

  public static make(file: FileItemOpts): FsFileItem {
    return new FsFileItem(
      file.name,
      file.filename,
      file.path,
      file.pathRelative,
      file.extension,
      file.isDirectory || false,
      file.isFile || false,
      file.isSymbolicLink || false,
      file.isHidden || false,
      file.lastModified,
      file.size,
      file.sizeHuman,
    )
  }

  public static async makeFromPath(path: string): Promise<FsFileItem> {
    const filename = path.split('/').pop() || ''
    const name = filename.split('.').slice(0, -1).join('.')
    let absolutePath = path

    const rootPath = FsPath.root()
    let relativePath = absolutePath.replace(rootPath, '')
    if (absolutePath.startsWith('/'))
      relativePath = relativePath.substring(1)
    else
      absolutePath = FsPath.root(absolutePath)

    const stats = await FsFileNative.stat(absolutePath)

    return FsFileItem.make({
      name,
      filename,
      path: absolutePath,
      pathRelative: relativePath,
      extension: filename.split('.').pop(),
      isDirectory: stats?.isDirectory(),
      isFile: stats?.isFile(),
      isSymbolicLink: stats?.isSymbolicLink(),
      isHidden: filename.startsWith('.'),
      lastModified: stats?.mtimeMs,
      size: stats?.size,
      sizeHuman: await FsFileNative.bytesHuman(absolutePath),
    })
  }
}
