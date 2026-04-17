export type FetchOptions = RequetInit & {
    query?: QueryObject
}

export interface FetchResult {
    message?: string
    success?: boolean
}

export interface Pagination {
    current_page: number
    last_page: number
    total_data: number
}

export interface DashboardCard {
    count: number
}

export type PaginatedData<T, K extends string> = Pagination & {
    [P in K]: T[]
}

export type AddedData<T, K extends string> = {
    [P in K]: T[]
}

export type Result<T> = FetchResult & {
    data: T
}

export type LoginResult = Result<AuthSession>

export type LogoutResult = FetchResult

// DASHBOARD
export type DashboardTenantListResult = Result<{
    tenants: Tenant[]
}>

export type DashboardCardTotalTenantResult = Result<DashboardCard>

// TENANTS
export type TenantListResult = Result<
    PaginatedData<Tenant, 'tenants'>
>

export type TenantDetailResult = Result<Tenant>

export type TenantFormResult = Result<TenantForm>

export type TenantAddResult = Result<
    AddedData<number, 'tenant_id'>
>

// EVENTS
export type TenantEventListResult = Result<
    PaginatedData<TenantEvent, 'event'>
>

export type TenantEventDetailResult = Result<TenantEvent>

export type TenantEventFormResult = Result<TenantEventForm>

export type TenantEventAddResult = Result<
    AddedData<number, 'event_id'>
>

export type TenantEventUserFound = Result<{
    users: User[]
}>

// EVENT SESSION
export type TenantEventSessionListResult = Result<
    PaginatedData<TenantEventSession, 'event_session'>
>

export type TenantEventSessionFound = Result<{
    event_session: TenantEventSession[]
}>

export type TenantEventSessionDetailResult = Result<TenantEventSession>

export type TenantEventSessionFormResult = Result<TenantEventSessionForm>

export type TenantEventSessionAddResult = Result<
    AddedData<number, 'event_session_id'>
>

// CUSTOM ATTRIBUTES
export type CustomAttributeListResult = Result<
    PaginatedData<CustomAttribute, 'custom_attribute'>
>

export type CustomAttributeFound = Result<{
    custom_attribute: CustomAttribute[]
}>

export type CustomAttributeAddResult = Result<
    AddedData<number, 'custom_attribute_id'>
>

// EVENT SETTINGS
export type TenantEventSettingResult = Result<TenantEventSetting>

// TEMPLATE
export type ScanPageTemplateResult = Result<Template>

// PARTICIPANTS
export type ParticipantListResult = Result<
    PaginatedData<Participant, 'participant'>
>

export type ParticipantDetailresult = Result<Participant>

export type ParticipantFormResult = Result<ParticipantForm>

export type ParticipantAddResult = Result<
    AddedData<number, 'participant_id'>
>

export type PrintQRRequest = {
    participant_ids?: number[]
}

export type PrintQRResult = Result<{
    filepath: string
}>

export type ParticipantCheckInResult = Result<{
    participant: {
        participant_id: number
        name: string
        max_attendance: number
        custom_attributes: CustomAttribute[]
    }
    confirmation_attendance: boolean
}>

export type ParticipantExportRequest = {
    query: string
    custom_attribute?: CustomAttribute[]
    is_checked_in?: boolean
    phone_number?: string
}

export type ParticipantExportResult = Result<{
    filepath: string
}>

// USERS
export type TenantMemberListresult = Result<
    PaginatedData<User, 'user'>
>

export type TenantMemberDetailResult = Result<User>

export type TenantMemberFormResult = Result<UserForm>

export type TenantMemberAddResult = Result<
    AddedData<number, 'user_id'>
>
