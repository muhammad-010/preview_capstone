declare module '#auth-utils' {
    interface User {
        id: number
        name: string
        avatar_url: string | null
        role_slug: RoleSlug
    }

    interface SecureSessionData {
        access_token: string
    }

    interface UserSession {
        user: User
        secure: SecureSessionData
    }
}

export {}
