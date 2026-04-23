/* eslint-disable @typescript-eslint/no-explicit-any */
export type Status = 'Active' | 'Inactive'

export interface ActivateDeactivate {
    status: Status
}

export interface Setting {
    value: boolean
}

/**
 * Represents YYYY-MM-DDTHH:mm:ssZ on FE (since JS toISOString)
 *
 * Represents YYYY-MM-DDTHH:mm:ss+hh:mm from BE
 * */
export type ISOString = string

/** HH:mm:ss */
export type HourString = string

export type RoleSlug = 'superadmin' | 'tenant.admin' | 'tenant.member'

export interface Phone {
    number: string
    country_code?: string
}

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
export type TenantOwnerPhone = Phone

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
export type TenantEventStatus = 'Active' | 'Upcoming' | 'Live' | 'Completed'

export interface TenantEventCapacity {
    total: number
    used: number
}

export interface TenantEventParticipantStatus {
    total_registered: number
    total_checked_in: number
}

export interface TenantEventRuleConfig {
    capacity?: TenantEventCapacity
    confirmation_attendance?: boolean
}

export interface TenantEvent {
    event_id?: number
    name: string
    start_time: ISOString
    location: string
    status: TenantEventStatus

    description?: string
    end_time?: ISOString
    rule_config?: TenantEventRuleConfig
    capacity?: TenantEventCapacity
    assigned_users?: User[]
    assign_user_ids: number[]
    participant_status?: TenantEventParticipantStatus

    public_ticket_retrieval?: Setting
}

export interface TenantEventForm {
    name: string
    description: string
    location: string
    start_time: ISOString
    end_time: ISOString
    status: TenantEventStatus
    capacity: number
    assign_user_ids: number[]
}

// EVENT SESSIONS
export interface TenantEventSession {
    event_session_id: number
    name: string
    start_time: ISOString
    end_time: ISOString
    location: string
    checked_in_at?: ISOString | null
    participant_status?: TenantEventParticipantStatus
}

export interface TenantEventSessionForm {
    name: string
    start_time: ISOString
    end_time: ISOString
    location: string
}

// CUSTOM ATTRIBUTES
export interface CustomAttribute {
    custom_attribute_id: number
    name?: string
    value?: string
    is_visible?: boolean
}

export interface CustomAttributeForm {
    name: string
    is_visible: boolean
}

// EVENT SETTINGS
export type TenantEventSettingKeys = 'confirmation_attendance' | 'public_ticket_retrieval'

export type TenantEventSetting = Record<TenantEventSettingKeys, Setting>

// TEMPLATE
export interface TemplateElement {
    element_id?: number
    type: string
    value: string
    position_x: number
    position_y: number
    style: Record<string, any>
    setting: Record<string, any>
}

export interface TemplateVariant {
    variant_id?: number
    slug: string
    background_image_url: string | null
    setting: Record<string, any>
    elements: TemplateElement[]
}

export interface Template {
    template_id?: number
    type: string
    variants: TemplateVariant[]
}

// PARTICIPANT
export type ParticipantStatus = 'Pending' | 'Checked In'
export type ParticipantSessionStatus = 'none' | 'partial' | 'completed'
export type ParticipantCategory = 'VIP' | 'Regular'
export type SendChannel = 'email' | 'whatsapp'
export type InvitationStatus = 'On Queue' | 'Success' | 'Failed'

export type ParticipantPhone = Phone

export interface ParticipantInvitationLog {
    email?: {
        status: InvitationStatus
    }
    whatsapp?: {
        status: InvitationStatus
    }
}

export interface ParticipantCheckInProgress {
    total: number
    count: number
}

export interface Participant {
    participant_id?: number
    name: string
    email: string
    phone_number: string
    status: ParticipantStatus
    check_in_time: ISOString
    number_of_attendance: number | null
    max_attendance: number
    custom_attribute: CustomAttribute[] | null
    latest_invitation_log?: ParticipantInvitationLog | null
    check_in_progress?: ParticipantCheckInProgress

    phone?: Phone
    ticket_path?: string
}

export interface ParticipantForm {
    name: string
    email: string
    phone_number: string
    max_attendance: number
    custom_attribute: CustomAttribute[] | null
}

export interface ParticipantCheckIn {
    token: string
    count_attendance?: number
}

// USERS
export type UserPhone = Phone

export interface User {
    user_id?: number
    name: string
    avatar_url: string | null

    email?: string
    phone?: UserPhone
    status?: Status
    tenant_role_id?: number
    role_str?: string
}

export interface UserForm {
    name: string
    email: string
    phone_number: string
    status: Status
    tenant_role_id: number
    password: string
    password_confirm: string
}
