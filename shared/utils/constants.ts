import type { RoleSlug, Status } from '../types/data'

// STATUS
export const STATUS_ACTIVE: Status = 'active'
export const STATUS_INACTIVE: Status = 'inactive'

export const STATUS_DROPDOWN: Status[] = [
    STATUS_ACTIVE,
    STATUS_INACTIVE,
]

export const STATUS_COLORS: Record<Status, 'success' | 'error'> = {
    [STATUS_ACTIVE]: 'success',
    [STATUS_INACTIVE]: 'error',
} as const

// ROLES
export const ROLE_SUPER_ADMIN: RoleSlug = 'superadmin'
export const ROLE_ADMIN_TENANT: RoleSlug = 'tenant.admin'
export const ROLE_POC_TENANT: RoleSlug = 'tenant.poc'

export const ROLE_ROUTES: Record<RoleSlug, string[]> = {
    [ROLE_SUPER_ADMIN]: APP_SUPER_ADMIN_ROUTES,
    [ROLE_ADMIN_TENANT]: APP_TENANT_ADMIN_ROUTES,
    [ROLE_POC_TENANT]: APP_POC_ADMIN_ROUTES,
} as const
