export default defineEventHandler(async (event): Promise<TenantOrderListResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const path = `/tenant/${tenantId}/order`
    const query = getQuery(event)

    const res: TenantOrderListResult = await api(event, method, path, {
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
