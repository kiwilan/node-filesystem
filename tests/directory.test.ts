import { expect, it } from 'vitest'
import { FsFile, FsPath } from '../src'

it('can create directory', async () => {
  await FsFile.deleteDirectory(FsPath.root('tests/test'))
  await FsFile.makeDirectory(FsPath.root('tests/test'), true)

  await FsFile.copy(FsPath.root('tests/test.md'), FsPath.root('tests/test/test.md'))
  await FsFile.ensureDirectoryExists(FsPath.root('tests/test'))
  const exists = await FsFile.exists(FsPath.root('tests/test/test.md'))

  expect(exists).toBe(true)
})
