import { $fetch } from 'ofetch'
import type { H3Event } from 'h3'

async function _api<T>(
    auth: boolean,
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
    if (auth) {
        if (session?.secure?.access_token) {
            headers.set('Authorization', `Bearer ${session.secure.access_token}`)
        }
        if (!path.startsWith('/auth')) {
            const _ = await requireUserSession(event)
        }
    }
    return await $fetch.create({
        onResponseError({ response }) {
            console.error({
                url: response.url,
                status: response.status,
                statusText: response.statusText,
                data: response._data,
            })
            throw createError({
                statusCode: response.status,
                statusMessage: response.statusText,
                data: response._data,
            })
        },
    })<T>(path, {
        ...options,
        method,
        baseURL: externalApi,
        credentials: 'include',
        headers,
    })
}

export async function apiNoAuth<T>(
    event: H3Event,
    method: string,
    path: string,
    options: FetchOptions = {},
): Promise<T> {
    return await _api(false, event, method, path, options)
}

export async function api<T>(
    event: H3Event,
    method: string,
    path: string,
    options: FetchOptions = {},
): Promise<T> {
    return await _api(true, event, method, path, options)
}
