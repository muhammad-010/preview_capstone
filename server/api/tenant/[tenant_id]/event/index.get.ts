export default defineEventHandler(async (event): Promise<TenantEventListResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const path = `/tenant/${tenantId}/event`
    const query = getQuery(event)

    const res: TenantEventListResult = await externalApi(event, method, path, {
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
