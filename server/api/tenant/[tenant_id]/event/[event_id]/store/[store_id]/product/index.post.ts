export default defineEventHandler(async (event): Promise<TenantEventStoreProductAddResult> => {
    const method = 'POST'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const storeId = getRouterParam(event, 'store_id')
    const path = `/tenant/${tenantId}/event/${eventId}/store/${storeId}/product`
    const body = await readBody(event)

    const res: TenantEventStoreProductAddResult = await api(event, method, path, {
        body,
    })
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
