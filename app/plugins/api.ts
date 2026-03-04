export default defineNuxtPlugin((nuxtApp) => {
    const api = $fetch.create({
        async onResponseError({ response }) {
            if (response.status === 401) {
                await nuxtApp.runWithContext(async () => {
                    const { clear } = useUserSession()
                    await clear()
                    await navigateTo('/auth', { replace: true })
                })
            }
        },
    })

    return {
        provide: {
            api,
        },
    }
})
