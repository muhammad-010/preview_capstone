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
    PaginatedData<TenantEvent, 'events'>
>

export type TenantEventDetailResult = Result<TenantEvent>

export type TenantEventAddResult = Result<
    AddedData<number, 'event_id'>
>

export type TenantEventUserFound = Result<{
    users: User[]
}>

export type ParticipantListResult = Result<
    PaginatedData<Participant, 'participant'>
>

export type PrintQRResult = Result<{
    filepath: string
}>
