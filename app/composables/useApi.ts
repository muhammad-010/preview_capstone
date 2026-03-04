import type { UseFetchOptions } from 'nuxt/app'

export const useApi: typeof useFetch = <T>(url: string, opts?: UseFetchOptions<T>) => {
    return useFetch(url, {
        ...opts,
        $fetch: useNuxtApp().$api as typeof $fetch,
    })
}
