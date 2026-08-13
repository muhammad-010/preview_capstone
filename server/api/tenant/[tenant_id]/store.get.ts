export default defineEventHandler(async (event): Promise<TenantStoreListResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const path = `/tenant/${tenantId}/store`
    const query = getQuery(event)

    const res: TenantStoreListResult = await api(event, method, path, {
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
