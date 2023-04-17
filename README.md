# Kiwilan's Node filesystem

[![node][node-version-src]][node-version-href]
[![version][version-src]][version-href]
[![downloads][downloads-src]][downloads-href]
[![license][license-src]][license-href]

[![tests][tests-src]][tests-href]
[![codecov][codecov-src]][codecov-href]

This Node module has been built to improve [native filesystem](https://nodejs.org/api/fs.html) with [Laravel](https://laravel.com/) like helpers.

## Installation

```bash
npm add @kiwilan/filesystem
```

Or with [pnpm](https://pnpm.js.org/):

```bash
pnpm add @kiwilan/filesystem
```

## Usage

```ts
const path = FsPath.root("tests/test.md");
const exists = await FsFile.exists(path);

if (exists) {
  const content = await FsFile.get(path);
}
```

## Build locally

```bash
pnpm package
```

Add to your project:

```json
{
  "dependencies": {
    "@kiwilan/filesystem": "file:~/kiwilan-filesystem-*.tgz"
  }
}
```

[version-src]: https://img.shields.io/npm/v/@kiwilan/filesystem.svg?style=flat-square&colorA=18181B&colorB=339933
[version-href]: https://www.npmjs.com/package/@kiwilan/filesystem
[node-version-src]: https://img.shields.io/static/v1?style=flat-square&label=Node.js&message=v16&color=339933&logo=node&logoColor=ffffff&labelColor=18181b
[node-version-href]: https://www.php.net/
[downloads-src]: https://img.shields.io/npm/dt/@kiwilan/filesystem.svg?style=flat-square&colorA=18181B&colorB=339933
[downloads-href]: https://www.npmjs.com/package/@kiwilan/filesystem
[license-src]: https://img.shields.io/github/license/kiwilan/node-filesystem.svg?style=flat-square&colorA=18181B&colorB=339933
[license-href]: https://github.com/kiwilan/node-filesystem/blob/main/README.md
[tests-src]: https://img.shields.io/github/actions/workflow/status/kiwilan/node-filesystem/run-tests.yml?branch=main&label=tests&style=flat-square&colorA=18181B
[tests-href]: https://github.com/kiwilan/node-filesystem/actions/workflows/run-tests.yml
[codecov-src]: https://codecov.io/gh/kiwilan/node-filesystem/branch/main/graph/badge.svg?token=SHQV8D60YV
[codecov-href]: https://codecov.io/gh/kiwilan/node-filesystem
