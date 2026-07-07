import type { UseFetchOptions } from 'nuxt/app'

export const useLazyApi: typeof useLazyFetch = <T>(url: string, opts?: UseFetchOptions<T>) => {
    const { clear } = useUserSession()
    const nuxtApp = useNuxtApp()

    return useLazyFetch(url, {
        ...opts,
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
