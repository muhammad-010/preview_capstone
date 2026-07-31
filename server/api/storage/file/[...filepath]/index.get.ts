export default defineEventHandler(async (event) => {
    const method = 'GET'
    const { filepath } = event.context.params ?? {}
    if (!filepath) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Filepath is required',
        })
    }
    const path = `storage/file/${filepath}`

    const res = await api(event, method, path, {})
    if (res) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
