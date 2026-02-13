export type FetchOptions = RequetInit & {
    query?: QueryObject
}

export interface FetchResult {
    message?: string
    success?: boolean
    redirect?: string
}

export interface Pagination {
    current_page: number
    last_page: number
    total_data: number
}

export type LoginResult = FetchResult & {
    data: {
        access_token: string
        expired_in_sec: number
        user: {
            id: number
            name: string
            avatar_url: string | null
            role_slug: RoleSlug
        }
    }
}

export type LogoutResult = FetchResult

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

export type DashboardTenantListResult = Result<{
    tenants: Tenant[]
}>

export type DashboardCardTotalTenantResult = Result<DashboardCard>

export type TenantListResult = Result<
    PaginatedData<Tenant, 'tenants'>
>

export type TenantDetailResult = Result<Tenant>

export type TenantAddResult = Result<
    AddedData<number, 'tenant_id'>
>
