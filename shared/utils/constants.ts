import type { RoleSlug, Status, TenantEventStatus } from '../types/data'

// STATUS
export const STATUS_ACTIVE: Status = 'Active'
export const STATUS_INACTIVE: Status = 'Inactive'

export const STATUS_DROPDOWN: Status[] = [
    STATUS_ACTIVE,
    STATUS_INACTIVE,
]

export const STATUS_COLORS: Record<Status, 'success' | 'error'> = {
    [STATUS_ACTIVE]: 'success',
    [STATUS_INACTIVE]: 'error',
} as const

// TENANT_EVENT_STATUS
export const TENANT_EVENT_STATUS_ACTIVE: TenantEventStatus = 'Active'
export const TENANT_EVENT_STATUS_INACTIVE: TenantEventStatus = 'Inactive'
export const TENANT_EVENT_STATUS_DRAFT: TenantEventStatus = 'Draft'
export const TENANT_EVENT_STATUS_UPCOMING: TenantEventStatus = 'Upcoming'
export const TENANT_EVENT_STATUS_LIVE: TenantEventStatus = 'Live'
export const TENANT_EVENT_STATUS_COMPLETED: TenantEventStatus = 'Completed'

export const TENANT_EVENT_STATUS_DROPDOWN: TenantEventStatus[] = [
    TENANT_EVENT_STATUS_ACTIVE,
    TENANT_EVENT_STATUS_INACTIVE,
    TENANT_EVENT_STATUS_DRAFT,
    TENANT_EVENT_STATUS_UPCOMING,
    TENANT_EVENT_STATUS_LIVE,
    TENANT_EVENT_STATUS_COMPLETED,
]

export const TENANT_EVENT_STATUS_COLORS: Record<
    TenantEventStatus, 'success' | 'error' | 'primary' | 'secondary' | 'info' | 'warning'
> = {
    [TENANT_EVENT_STATUS_ACTIVE]: 'success',
    [TENANT_EVENT_STATUS_INACTIVE]: 'error',
    [TENANT_EVENT_STATUS_DRAFT]: 'error',
    [TENANT_EVENT_STATUS_UPCOMING]: 'warning',
    [TENANT_EVENT_STATUS_LIVE]: 'success',
    [TENANT_EVENT_STATUS_COMPLETED]: 'primary',
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

export const ROLE_NAME: Record<RoleSlug, string> = {
    [ROLE_SUPER_ADMIN]: 'Super Admin',
    [ROLE_ADMIN_TENANT]: 'Tenant Admin',
    [ROLE_POC_TENANT]: 'Tenant POC',
} as const
