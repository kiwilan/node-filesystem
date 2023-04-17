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
