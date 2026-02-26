import type { RoleSlug } from '../types/data'

export function isSuperAdmin(role: RoleSlug) {
    return role === ROLE_SUPER_ADMIN
}

export function isTenantAdmin(role: RoleSlug) {
    return role === ROLE_ADMIN_TENANT
}

export function isPocTenant(role: RoleSlug) {
    return role === ROLE_POC_TENANT
}

export function roleName(role: RoleSlug | null) {
    return role ? ROLE_NAME[role] : ''
}

export function roleRoute(role: RoleSlug | null) {
    return role ? ROLE_ROUTES[role] : []
}
