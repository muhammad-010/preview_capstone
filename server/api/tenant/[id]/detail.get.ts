export default defineEventHandler(async (event): Promise<TenantDetailResult> => {
    const method = 'GET'
    const id = getRouterParam(event, 'id')
    const path = `/tenant/${id}/detail`

    const res: TenantDetailResult = await externalApi(event, method, path, {})
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
