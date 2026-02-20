export default defineEventHandler(async (event): Promise<TenantListResult> => {
    const method = 'GET'
    const path = '/tenant'
    const query = getQuery(event)

    const res: TenantListResult = await api(event, method, path, {
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
