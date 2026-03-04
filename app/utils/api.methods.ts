import type { FetchResponse } from 'ofetch'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiOnResponseError(response: FetchResponse<any>) {
    const { clear } = useUserSession()
    const nuxtApp = useNuxtApp()

    if (response.status === 401) {
        await nuxtApp.runWithContext(async () => {
            await clear()
            await navigateTo('/auth', { replace: true })
        })
    }
}
