export default defineEventHandler(async (event): Promise<TenantEventStoreProductListResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const storeId = getRouterParam(event, 'store_id')
    const path = `/tenant/${tenantId}/event/${eventId}/store/${storeId}/product`
    const query = getQuery(event)

    const res: TenantEventStoreProductListResult = await api(event, method, path, {
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
