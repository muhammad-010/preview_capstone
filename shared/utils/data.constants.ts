import type { Status, TenantEventStatus } from '../types/data'

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
export const TENANT_EVENT_STATUS_UPCOMING: TenantEventStatus = 'Upcoming'
export const TENANT_EVENT_STATUS_LIVE: TenantEventStatus = 'Live'
export const TENANT_EVENT_STATUS_COMPLETED: TenantEventStatus = 'Completed'

export const TENANT_EVENT_STATUS_DROPDOWN: TenantEventStatus[] = [
    TENANT_EVENT_STATUS_ACTIVE,
    TENANT_EVENT_STATUS_UPCOMING,
    TENANT_EVENT_STATUS_LIVE,
    TENANT_EVENT_STATUS_COMPLETED,
]

export const TENANT_EVENT_STATUS_COLORS: Record<
    TenantEventStatus, 'success' | 'error' | 'primary' | 'secondary' | 'info' | 'warning'
> = {
    [TENANT_EVENT_STATUS_ACTIVE]: 'success',
    [TENANT_EVENT_STATUS_INACTIVE]: 'error',
    [TENANT_EVENT_STATUS_UPCOMING]: 'warning',
    [TENANT_EVENT_STATUS_LIVE]: 'success',
    [TENANT_EVENT_STATUS_COMPLETED]: 'primary',
} as const
