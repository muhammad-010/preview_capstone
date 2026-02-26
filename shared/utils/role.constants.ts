import type { RoleSlug } from '../types/data'

export const ROLE_SUPER_ADMIN: RoleSlug = 'superadmin'
export const ROLE_ADMIN_TENANT: RoleSlug = 'tenant.admin'
export const ROLE_POC_TENANT: RoleSlug = 'tenant.poc'

export const ROLE_ROUTES: Record<RoleSlug, string[]> = {
    [ROLE_SUPER_ADMIN]: APP_SUPER_ADMIN_ROUTES,
    [ROLE_ADMIN_TENANT]: APP_TENANT_ADMIN_ROUTES,
    [ROLE_POC_TENANT]: APP_POC_ADMIN_ROUTES,
} as const

export const ROLE_NAME: Record<RoleSlug, string> = {
    [ROLE_SUPER_ADMIN]: 'Super Admin',
    [ROLE_ADMIN_TENANT]: 'Tenant Admin',
    [ROLE_POC_TENANT]: 'Tenant POC',
} as const
