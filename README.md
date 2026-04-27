# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Deployment & CI/CD

### Railway Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Railway.

### GitLab CI/CD Pipeline
See [GITLAB_CI_SETUP.md](./GITLAB_CI_SETUP.md) for setting up automated builds and deployments with GitLab CI.

# Directory Guidelines

## app/composables

[Watch this](https://www.youtube.com/watch?v=N0QrFKBZuqA) for detailed information about composables.

Files inside this directory should use `use` as naming prefix.

If the composables utilizes `useState`, the file name (and also the function) should use `State` as it's suffix.

When utilizing `useState`, avoid mutating `.value` directly, use setter.

## app/utils

Contains utility functions and constants that related into client-side code.

`constants.ts` and `methods.ts` are used for generic constants and functions respectively.

If you want to group into more specific files, use `<util>.constants.ts` or `<util>.methods.ts` naming pattern.

## server/utils

Contains utility functions and constants that related into server-side code.

naming pattern and rules same as [app/utils](#apputils).

## shared/types

Contains type definition used across client-side and server-side code.

Any client-side related types goes into `app.d.ts` and server-side related types goes into `server.d.ts`.

If you want to group into more specific files, use `<type>.d.ts` naming pattern.

## shared/utils

Contains type definition used across client-side and server-side code.

Different from [shared/types](#sharedtypes), utils are STRICTLY not related into client-side and server-side.

naming pattern and rules same as [app/utils](#apputils) and [server/utils](#serverutils)

# DEPRECATION

## API
- [x] api/tenant/[tenant_id]/event/[event_id]/participant/check-in
- [x] api/tenant/[tenant_id]/event/[event_id]/participant/check-in/manual
- [x] api/tenant/[tenant_id]/event/[event_id]/participant/check-in/confirm
- [x] api/tenant/[tenant_id]/event/[event_id]/participant/check-in/confirm/manual

## APP
- [x] components/CheckIn/Manual
- [x] components/CheckIn/ManualPreview
- [x] components/CheckIn/Scan
- [x] components/CheckIn/ScanPreview
- [x] components/Pages/CheckIn/Layout
- [x] layouts/check-in-preview
- [ ] layouts/check-in (rename scan into check-in)
- [ ] middleware/checkIn
- [x] pages/check-in/[event_id]/index
- [x] pages/check-in/[event_id]/new
- [ ] pages/check-in/[event_id]/[session_id]/old

## PUBLIC
- [ ] BTN-Event-Landscape.jpg
- [ ] BTN-Event-Portrait.jpg