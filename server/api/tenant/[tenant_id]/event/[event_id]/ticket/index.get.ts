export default defineEventHandler(async (event): Promise<TenantEventTicketListResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const path = `/tenant/${tenantId}/event/${eventId}/ticket`
    const query = getQuery(event)

    const res: TenantEventTicketListResult = await api(event, method, path, {
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
