import type { AuthSessionAssignedTenant } from './data'

declare module '#auth-utils' {
    interface User {
        id: number
        name: string
        avatar_url: string | null
        assigned_tenant: AuthSessionAssignedTenant[]
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
