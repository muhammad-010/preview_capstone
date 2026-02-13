export default defineEventHandler(async (event): Promise<FetchResult> => {
    const method = 'PATCH'
    const id = getRouterParam(event, 'id')
    const path = `/tenant/${id}/status`
    const body = await readBody(event)

    const res: FetchResult = await externalApi(event, method, path, {
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
