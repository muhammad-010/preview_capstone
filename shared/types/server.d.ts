export interface FetchResult {
    message?: string
    redirect?: string
}

export interface LoginResult {
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
    message: string
    success: boolean
}

export interface LogoutResult {
    message: string
    success: boolean
}
