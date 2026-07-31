export default defineEventHandler(async (event): Promise<TenantEventTicketFormResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const ticketId = getRouterParam(event, 'ticket_id')
    const path = `/tenant/${tenantId}/event/${eventId}/ticket/${ticketId}`

    const rawres: TenantEventTicketDetailresult = await api(event, method, path, {})
    const res = {
        ...rawres,
        data: tenantEventTicketToTenantEventTicketForm(rawres.data),
    }
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
