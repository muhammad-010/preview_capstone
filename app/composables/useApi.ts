import type { UseFetchOptions } from 'nuxt/app'

export const useApi: typeof useFetch = <T>(url: string, opts?: UseFetchOptions<T>) => {
    return useFetch(url, {
        ...opts,
        async onResponseError({ response }) {
            apiOnResponseError(response)
        },
    })
}
