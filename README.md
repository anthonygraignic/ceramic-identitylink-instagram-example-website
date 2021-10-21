# Ceramic Identity Link example website for Instagram

Generate a Verifiable Credential for Instagram with [Ceramic](https://ceramic.network/) and its [Identity Link Services](https://github.com/ceramicstudio/identitylink-services)

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Ceramic

Install Ceramic using `npm install -g @ceramicnetwork/cli @ceramicstudio/idx-cli` & run the server locally using `npm run ceramic`

### Identity Link Services

See instructions on https://github.com/ceramicstudio/identitylink-services  to run the `packages/server` and to configure your Instagram credentials.

## Building

Before creating a production version of your app, install an [adapter](https://kit.svelte.dev/docs#adapters) for your target environment. Then:

```bash
npm run build
```

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.
