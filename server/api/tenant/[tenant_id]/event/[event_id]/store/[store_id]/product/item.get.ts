export default defineEventHandler(async (event): Promise<TenantEventStoreProductItemResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const storeId = getRouterParam(event, 'store_id')
    const path = `/tenant/${tenantId}/event/${eventId}/store/${storeId}/product/item`
    const query = getQuery(event)

    const res: TenantEventStoreProductItemResult = await api(event, method, path, {
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
