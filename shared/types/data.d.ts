export type Status = 'Active' | 'Inactive'

/** Represents YYYY-MM-DDTHH:mm:ssZ */
export type ISOString = string

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

export interface TenantOwnerPhone {
    number: string
    country_code: string
}

export interface TenantOwner {
    name: string
    email: string
    avatar_url: string | null
    phone: TenantOwnerPhone
}

export interface Tenant {
    tenant_id: number
    name: string
    status: Status

    owner?: TenantOwner
    total_event?: number
    total_registered_user?: number
    plan?: string
    joined_date?: ISOString
}
