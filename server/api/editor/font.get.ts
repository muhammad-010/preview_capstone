export default defineEventHandler(async (event): Promise<TemplateFontResult> => {
    const method = 'GET'
    const path = '/editor/font'
    const query = getQuery(event)

    const res: TemplateFontResult = await api(event, method, path, {
        query,
    })
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
