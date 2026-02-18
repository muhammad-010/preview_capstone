export type Status = 'Active' | 'Inactive'

export interface ActivateDeactivate {
    status: Status
}

export type TenantEventStatus = 'Active' | 'Upcoming' | 'Live' | 'Completed'

export type ParticipantStatus = 'Pending' | 'Checked In'

/** Represents YYYY-MM-DDTHH:mm:ssZ */
export type ISOString = string

export type RoleSlug = 'superadmin' | 'tenant.admin' | 'tenant.poc'

// AUTH

export interface AuthSessionAssignedTenant {
    id: number
    name: string
    role_slug: RoleSlug
}

export interface AuthSessionUser {
    id: number
    name: string
    avatar_url: string | null
    assigned_tenant: AuthSessionAssignedTenant[]
}

export interface AuthSession {
    access_token: string
    expired_in_sec: number
    user: AuthSessionUser
}

// TENANTS

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

// EVENTS

export interface TenantEventCapacity {
    total: number
    used: number
}

export interface TenantEventParticipantStatus {
    total_registered: number
    total_checked_in: number
}

export interface TenantEvent {
    event_id?: number
    name: string
    start_time: ISOString
    location: string
    status: TenantEventStatus

    description?: string
    end_time?: ISOString
    capacity?: TenantEventCapacity
    confirmation_attendance?: boolean
    assigned_users?: User[]
    participant_status?: TenantEventParticipantStatus
}

export interface TenantEventForm {
    name: string
    description: string
    location: string
    start_time: ISOString
}

// USERS

export interface User {
    user_id: number
    name: string
    avatar_url: string | null
    role_str: string
}

// PARTICIPANT

export interface Participant {
    participant_id?: number
    name: string
    email: string
    phone_number: string
    status: ParticipantStatus
    check_in_time: ISOString
    number_of_attendance: number | null
}
