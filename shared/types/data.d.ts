export type Status = 'active' | 'inactive'

export type RoleSlug = 'superadmin' | 'tenant.admin' | 'tenant.poc'

export interface DummyTenant {
    id?: number
    tenantName: string
    status: Status

    adminName?: string
    adminEmail?: string
    adminPhone?: string
    adminPassword?: string
    planId?: number
    billingAddress?: string
    createdAt?: string

    confirmPassword?: string
    plan?: string
    events?: number
    registeredUsers?: number
}
