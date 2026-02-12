import { $fetch } from 'ofetch'
import type { H3Event } from 'h3'

export async function externalApi<T>(
    event: H3Event,
    method: string,
    path: string,
    options: FetchOptions = {},
): Promise<T> {
    const externalApi = process.env.EXTERNAL_API_URL
    if (!externalApi) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'No External API defined',
        })
    }

    const session = await getUserSession(event)
    const headers = new Headers(options.headers || {})
    if (session?.secure?.access_token) {
        headers.set('Authorization', `Bearer ${session.secure.access_token}`)
    }
    if (!path.startsWith('/auth')) {
        const _ = await requireUserSession(event)
    }
    return await $fetch<T>(path, {
        ...options,
        method,
        baseURL: externalApi,
        credentials: 'include',
        headers,
    })
}
