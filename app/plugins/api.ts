export default defineNuxtPlugin((nuxtApp) => {
    const api = $fetch.create({
        async onResponseError({ response }) {
            if (response.status === 401) {
                const { clear } = useUserSession()
                await nuxtApp.runWithContext(async () => {
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
