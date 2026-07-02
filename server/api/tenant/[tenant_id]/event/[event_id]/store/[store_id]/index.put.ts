export default defineEventHandler(async (event): Promise<FetchResult> => {
    const method = 'PUT'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const storeId = getRouterParam(event, 'store_id')
    const path = `/tenant/${tenantId}/event/${eventId}/store/${storeId}`
    const body = await readBody(event)

    const res: FetchResult = await api(event, method, path, {
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
