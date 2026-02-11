import type { AppRoute } from '../types/app'
import type { RoleSlug } from '../types/data'

export function matchRoute(pattern: string, path: string): boolean {
    const p = pattern.split('/')
    const c = path.split('/')

    if (p.length !== c.length) return false

    return p.every((seg, i) => seg.startsWith(':') || seg === c[i])
}

export function routePerRole(role: RoleSlug): AppRoute[] {
    const routes = ROLE_ROUTES[role]
    return APP_ROUTES
        .filter((route: AppRoute) => routes.includes(route.to))
}

export function defaultRedirect(role: RoleSlug): string {
    const appRoutes = routePerRole(role)
    for (const route of appRoutes) {
        if (route.isDefault) {
            return route.to
        }
    }
    return ''
}
