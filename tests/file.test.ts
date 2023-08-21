import { expect, it } from 'vitest'
import { FsFile, FsPath } from '../src'

it('can get file path', async () => {
  const path = FsPath.root('tests/test.md')
  const exists = await FsFile.exists(path)

  expect(exists).toBe(true)
})

it('can get file', async () => {
  const path = FsPath.root('tests/test.md')
  const content = await FsFile.get(path)

  expect(content).toContain('Test')
})

it('can get file sync', () => {
  const path = FsPath.root('tests/test.md')
  const content = FsFile.getSync(path)

  expect(content).toContain('Test')
})

it('can get file sync', async () => {
  const path = FsPath.root('tests/test.md')
  const fsItem = await FsFile.file(path)

  expect(fsItem.name).toBe('test')
  expect(fsItem.filename).toBe('test.md')
  expect(fsItem.path.includes('node-filesystem/tests/test.md')).toBe(true)
  expect(fsItem.pathRelative).toBe('tests/test.md')
  expect(fsItem.extension).toBe('md')
  expect(fsItem.isDirectory).toBe(false)
  expect(fsItem.isFile).toBe(true)
  expect(fsItem.isSymbolicLink).toBe(false)
  expect(fsItem.isHidden).toBe(false)
  expect(fsItem.lastModified).toBeGreaterThan(0)
  expect(fsItem.size).toBe(29)
  expect(fsItem.sizeHuman).toBe('29 B')
})
