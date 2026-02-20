export default defineEventHandler(async (event): Promise<TenantEventFormResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const path = `/tenant/${tenantId}/event/${eventId}`

    const rawres: TenantEventDetailResult = await api(event, method, path, {})
    const res = {
        ...rawres,
        data: tenantEventToTenantEventForm(rawres.data),
    }
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
