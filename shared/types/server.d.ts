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

export type PaginatedData<T, K extends string> = Pagination & {
    [P in K]: T[]
}

export type AddedData<T, K extends string> = {
    [P in K]: T[]
}

export type ListResult<T> = FetchResult & {
    data: T
}

export type DetailResult<T> = FetchResult & {
    data: T
}

export type AddResult<T> = FetchResult & {
    data: T
}

export type TenantListResult = ListResult<
    PaginatedData<Tenant, 'tenants'>
>

export type TenantDetailResult = DetailResult<Tenant>

export type TenantAddResult = AddResult<
    AddedData<number, 'tenant_id'>
>
