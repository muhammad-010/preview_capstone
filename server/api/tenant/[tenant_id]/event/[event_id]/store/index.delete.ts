export default defineEventHandler(async (event): Promise<FetchResult> => {
    const method = 'DELETE'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const path = `/tenant/${tenantId}/event/${eventId}/store`

    const res: FetchResult = await api(event, method, path, {})
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
