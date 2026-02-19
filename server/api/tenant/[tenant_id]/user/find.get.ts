export default defineEventHandler(async (event): Promise<TenantEventUserFound> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const path = `/tenant/${tenantId}/user/find`
    const query = getQuery(event)

    const res: TenantEventUserFound = await externalApi(event, method, path, {
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
