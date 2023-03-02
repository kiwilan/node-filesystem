# Fastify Utils

[![fastify](https://img.shields.io/static/v1?label=Fastify&message=v4.x&color=000000&style=flat-square&logo=fastify&logoColor=ffffff)](https://www.fastify.io)
[![typescript](https://img.shields.io/static/v1?label=TypeScript&message=v4.9&color=3178C6&style=flat-square&logo=typescript&logoColor=ffffff)](https://www.typescriptlang.org)
[![node.js](https://img.shields.io/static/v1?label=Node.js&message=v18.x&color=339933&style=flat-square&logo=node.js&logoColor=ffffff)](https://nodejs.org/en)
[![pnpm](https://img.shields.io/static/v1?label=pnpm&message=v7.x&color=F69220&style=flat-square&logo=pnpm&logoColor=ffffff)](https://pnpm.io)

[![npm](https://img.shields.io/npm/v/@kiwilan/fastify-utils.svg?style=flat-square&color=CB3837&logo=npm&logoColor=ffffff&label=npm)](https://www.npmjs.com/package/@kiwilan/fastify-utils)

Fastify Utils is a collection of utilities for [fastify](https://www.fastify.io/).

## Installation

```bash
npm add @kiwilan/fastify-utils tsx
```

Or with [pnpm](https://pnpm.js.org/):

```bash
pnpm add @kiwilan/fastify-utils tsx
```

## Usage

```bash
touch setup.js ; touch .eslintrc ; touch .env.example
```

```bash
cp .env.example .env
```

### Dev setup

In `.env`:

```bash
LOG_LEVEL=debug      # debug | error | fatal  | info | trace | warn | silent

PORT=3000
BASE_URL=localhost
HTTPS=false
```

In `setup.js`:

```javascript
import { Compiler } from "fastify-utils";

Compiler.make({
  // options
});
```

In `package.json`:

```json
{
  "scripts": {
    "postinstall": "npm run config",
    "config": "node setup.js",
    "dev": "npm run config && NODE_ENV=development tsx watch src .env"
  }
}
```

In `src/index.ts`:

```typescript
import { LocalServer } from "fastify-utils";

const server = LocalServer.make();

server.start({
  // options
});
```

#### Routes

In `src/routes/index.ts`:

```typescript
import { Route } from "fastify-utils";

export default Route.make({
  method: "GET",
  url: "/",
  handler: async (request, reply) => {
    return { hello: "world" };
  },
});
```

And for `src/routes/api/posts/index.ts`:

```typescript
import { Route } from "fastify-utils";

export default Route.make({
  method: "GET",
  url: "/api/posts", // autocomplete
  handler: async (request, reply) => {
    return { posts: [] };
  },
});
```

#### API key

In `.env`

```bash
# Could be left empty if you don't want to use it
API_KEY=
```

### Build setup

In `package.json`:

```json
{
  "scripts": {
    "build": "rimraf build && npm run config && NODE_ENV=production tsx setup.js && npm run check:types",
    "check:types": "tsc --noEmit"
  }
}
```

### Production setup

In `.env`:

```bash
LOG_LEVEL=error      # debug | error | fatal  | info | trace | warn | silent

PORT=3000 # pm2 port
BASE_URL=domain.com
HTTPS=true
```

In `package.json`:

```json
{
  "scripts": {
    "clean": "rimraf build && rimraf node_modules && pnpm install",
    "start": "node build/index.mjs",
    "pm2": "pm2 start --name 'social-oembed' './build/index.mjs'"
  }
}
```

## Build

```bash
pnpm build ; pnpm pack ; cp kiwilan-fastify-utils-0.0.1.tgz ~/kiwilan-fastify-utils-0.0.1.tgz
```
