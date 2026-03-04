export default defineNuxtPlugin(() => {
    const api = $fetch.create({
        async onResponseError({ response }) {
            apiOnResponseError(response)
        },
    })

    return {
        provide: {
            api,
        },
    }
})
