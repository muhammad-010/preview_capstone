export default defineEventHandler(async (event): Promise<TenantEventTicketAddResult> => {
    const method = 'POST'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const path = `/tenant/${tenantId}/event/${eventId}/ticket`
    const body = await readBody(event)

    const res: TenantEventTicketAddResult = await api(event, method, path, {
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
