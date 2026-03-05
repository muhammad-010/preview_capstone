import type { UseFetchOptions } from 'nuxt/app'

export const useApi: typeof useFetch = <T>(url: string, opts?: UseFetchOptions<T>) => {
    const { clear } = useUserSession()
    const nuxtApp = useNuxtApp()

    return useFetch(url, {
        ...opts,
        getCachedData() {
            return undefined
        },
        async onResponseError({ response }) {
            if (response.status === 401) {
                await nuxtApp.runWithContext(async () => {
                    await clear()
                    await navigateTo(APP_UNAUTHORIZED_REDIRECT, { replace: true })
                })
            }
        },
    })
}
