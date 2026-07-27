export default defineEventHandler(async (event): Promise<TenantEventStoreProductDetailResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const storeId = getRouterParam(event, 'store_id')
    const productId = getRouterParam(event, 'product_id')
    const path = `/tenant/${tenantId}/event/${eventId}/store/${storeId}/product/${productId}`
    const query = getQuery(event)

    const res: TenantEventStoreProductDetailResult = await api(event, method, path, {
        query,
    })
    if (res.success) {
        if (res.data.attributes === null) {
          res.data.attributes = []
        }
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
