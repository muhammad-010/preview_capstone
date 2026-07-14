# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (CI and `pnpm-workspace.yaml` use it; `package-lock.json` also exists but pnpm is canonical). Node 22.

```bash
pnpm dev        # Dev server at http://localhost:3000
pnpm build      # Production build (.output/)
pnpm preview    # Preview the production build locally
pnpm lint       # ESLint over the whole repo (eslint .)
pnpm generate   # Static generation
```

There is **no test framework** configured — do not assume `pnpm test` exists.

`postinstall` runs `nuxt prepare`, which regenerates `.nuxt/` (including the tsconfig references and the ESLint flat config that `eslint.config.mjs` extends). Run it after changing `nuxt.config.ts` or pulling new deps.

### Code style (enforced by ESLint stylistic — match it exactly)

4-space indentation · single quotes · **no semicolons** · always-multiline trailing commas. New code that violates these will fail `pnpm lint`.

## Architecture

Nuxt 4 (new `app/` dir layout) + Vue 3 + TypeScript, styled with **Nuxt UI 4** + Tailwind CSS 4. Data validation via **Zod 4**, tables via **@tanstack/vue-table**, sessions via **nuxt-auth-utils**, QR via **nuxt-qrcode**, images via **@nuxt/image**. This is an event-management / registration admin panel (tenants → events → sessions → participants, plus check-in, stores/products, and template editors).

### Backend-for-Frontend (BFF) proxy — the central pattern

The client **never** calls the external backend directly. Every `server/api/**` route is a thin proxy to an upstream API at `EXTERNAL_API_URL`, using helpers in [server/utils/api.methods.ts](server/utils/api.methods.ts):

- `api(event, method, path, options)` — attaches `Authorization: Bearer <access_token>` from the encrypted session and calls `requireUserSession` (except `/auth` paths).
- `apiNoAuth(event, method, path, options)` — same without auth.

Every handler follows the same shape (see any file under `server/api/`):

```ts
export default defineEventHandler(async (event): Promise<SomeResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const path = `/tenant/${tenantId}/...`
    const res: SomeResult = await api(event, method, path, { query: getQuery(event) })
    if (res.success) return res
    console.error(`${method} ${path} failed`, res)
    return res
})
```

Routing is file-based with method suffixes: `index.get.ts`, `index.post.ts`, `index.put.ts`, `index.delete.ts`, `status.patch.ts`. Binary/media pass-through goes via [server/api/files/](server/api/files/) and [server/api/upload/media.post.ts](server/api/upload/media.post.ts).

### Client data fetching

Three wrappers, all of which clear the session and redirect to `APP_UNAUTHORIZED_REDIRECT` on a 401:

- `useApi` ([app/composables/useApi.ts](app/composables/useApi.ts)) — wraps `useFetch`.
- `useLazyApi` ([app/composables/useLazyApi.ts](app/composables/useLazyApi.ts)) — wraps `useLazyFetch`.
- `$api` (injected by [app/plugins/api.ts](app/plugins/api.ts)) — wraps `$fetch` for imperative calls.

Convention: pass `transform: res => res.data` and derive typed `computed`s. Reusable fetchers live in [app/composables/useData.ts](app/composables/useData.ts) and [app/composables/useDataInfo.ts](app/composables/useDataInfo.ts).

### Auth, roles (RBAC) & multi-tenancy

- **Sessions**: `nuxt-auth-utils` encrypted cookies. `NUXT_SESSION_PASSWORD` must be ≥32 chars. Login ([server/api/auth/login.post.ts](server/api/auth/login.post.ts)) stores `user` + `secure.access_token`. Session `User`/`SecureSessionData` shapes are declared in [shared/types/auth.d.ts](shared/types/auth.d.ts).
- **Route guards** (global middleware, run in numbered order):
  - [app/middleware/01.auth.global.ts](app/middleware/01.auth.global.ts) — redirects unauthenticated users unless the path is under `APP_PUBLIC_ROUTE` (`/auth`, `/guest`).
  - [app/middleware/02.roleRoute.global.ts](app/middleware/02.roleRoute.global.ts) — checks the **first path segment** against the current role's allowed routes; throws 403 otherwise.
- **Three roles** (`superadmin`, `tenant.admin`, `tenant.member`) defined in [shared/utils/role.constants.ts](shared/utils/role.constants.ts); each maps to an allowed route-prefix list in [shared/utils/route.constants.ts](shared/utils/route.constants.ts) (`APP_SUPER_ADMIN_ROUTES`, etc.).
- **Active tenant**: a user has multiple `assigned_tenant`s. [app/composables/useUserState.ts](app/composables/useUserState.ts) (`useUserState()`) holds the active tenant index in `useState` and derives `roleSlug`, `tenantId`, `navigation`, and `redirect`. Switch via `setUserActiveTenantIndexState(index)` — never mutate the state ref directly. Most pages read `tenantId` from here and feed it into the `/api/tenant/${tenantId}/...` routes.

### Template editors (V1 & V2 coexist)

Two visual editors exist behind a feature flag:

- **V1**: [app/components/Editor/](app/components/Editor/) (`Editor/Main.vue`).
- **V2**: [app/components/EditorV2/](app/components/EditorV2/), a Canva-like editor whose store is [app/composables/useEditorV2.ts](app/composables/useEditorV2.ts) (provide/inject; panels/canvas stay thin). It **deliberately reuses V1's data model and save/preview pipeline** so the backend template format is unchanged — only the UX differs.

Toggle with `NUXT_PUBLIC_EDITOR_V2_ENABLED` → exposed as `runtimeConfig.public.editorV2Enabled`. Editors back the `digital-invitation-editor`, `digital-certificate-editor`, and `check-in-page-editor` pages under [app/pages/events/[event_id]/](app/pages/events/). Block/canvas constants live in [app/utils/block.constants.ts](app/utils/block.constants.ts).

## Directory conventions (from README.md — follow when adding files)

- **[app/composables/](app/composables/)** — files/functions prefixed `use`. If a composable uses `useState`, suffix its name with `State` (e.g. `useLayoutPropState`). Never mutate `useState` `.value` directly; expose/use setters.
- **[app/utils/](app/utils/)** — client-side only. Generic constants/functions go in `constants.ts` / `methods.ts`; grouped ones use `<name>.constants.ts` / `<name>.methods.ts`.
- **[server/utils/](server/utils/)** — server-side only; same naming rules. Auto-imported by Nitro.
- **[shared/types/](shared/types/)** — client types in `app.d.ts`, server types in `server.d.ts`, grouped as `<name>.d.ts`. Server response types use the generic `Result<T>` / `PaginatedData<T, K>` helpers.
- **[shared/utils/](shared/utils/)** — strictly side-agnostic utilities (no client- or server-specific APIs).

`shared/types` and `shared/utils` are **auto-imported on both client and server** (configured via `imports.dirs` + `nitro.imports.dirs` in [nuxt.config.ts](nuxt.config.ts)), so their exports need no explicit import.

## Theming

Global Nuxt UI theme overrides live in [app/app.config.ts](app/app.config.ts) (primary=`brand`, secondary=`purple`) and custom CSS in [app/assets/css/main.css](app/assets/css/main.css). Color mode is forced to `light`.

## Deployment

Deploys to **Railway** via **GitLab CI** ([.gitlab-ci.yml](.gitlab-ci.yml)) on the `staging` branch (lint → build → `railway up`). See [DEPLOYMENT.md](DEPLOYMENT.md) and [GITLAB_CI_SETUP.md](GITLAB_CI_SETUP.md). A [Dockerfile](Dockerfile)/[docker-compose.yml](docker-compose.yml) also exist for container deploys.

## Notes

- The README's "DEPRECATION" section tracks legacy check-in code being phased out (`layouts/check-in`, `middleware/checkIn`, `pages/check-in/[event_id]/[session_id]/old`). Prefer the non-deprecated equivalents when touching check-in flows.
