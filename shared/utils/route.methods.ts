import type { AppRoute } from '../types/app'
import type { RoleSlug } from '../types/data'

export function matchRoute(pattern: string, path: string): boolean {
    const p = pattern.split('/')
    const c = path.split('/')

    if (p.length !== c.length) return false

    return p.every((seg, i) => seg.startsWith(':') || seg === c[i])
}

export function routePerRole(role: RoleSlug | null): AppRoute[] {
    if (!role) {
        return []
    }
    const routes = roleRoute(role)
    return APP_ROUTES
        .filter((route: AppRoute) => routes.includes(route.to))
}

export function defaultRedirect(role: RoleSlug | null): string {
    if (!role) {
        return ''
    }
    const appRoutes = routePerRole(role)
    for (const route of appRoutes) {
        if (route.isDefault) {
            return route.to
        }
    }
    return ''
}
