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
    country_code?: string
}

export interface TenantOwner {
    name: string
    email: string
    avatar_url?: string | null
    phone: TenantOwnerPhone
    phone_number?: string
    password?: string
    confirm_password?: string
}

export interface Tenant {
    tenant_id: number
    name: string
    status: Status

    owner: TenantOwner
    total_event?: number
    total_registered_user?: number
    plan_id?: number
    plan?: string
    joined_at?: ISOString
}

export interface TenantForm {
    name: string
    status: Status

    owner_name: string
    owner_email: string
    owner_phone_number: string
    owner_password: string
    owner_password_confirm: string

    plan_id?: number
}
