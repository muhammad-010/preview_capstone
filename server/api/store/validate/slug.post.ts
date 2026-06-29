export default defineEventHandler(async (event): Promise<FetchResult> => {
    const method = 'POST'
    const path = '/store/validate/slug'
    const body = await readBody(event)

    const res: FetchResult = await api(event, method, path, {
        body,
    })
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
