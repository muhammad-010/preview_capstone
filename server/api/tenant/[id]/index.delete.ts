export default defineEventHandler(async (event): Promise<FetchResult> => {
    const method = 'DELETE'
    const id = getRouterParam(event, 'id')
    const path = `/tenant/${id}`

    const res: FetchResult = await externalApi(event, method, path, {})
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
