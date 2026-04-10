export default defineEventHandler(async (event): Promise<TenantEventSessionFormResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const sessionId = getRouterParam(event, 'session_id')
    const path = `/tenant/${tenantId}/event/${eventId}/session/${sessionId}`

    const rawres: TenantEventSessionDetailResult = await api(event, method, path, {})
    const res = {
        ...rawres,
        data: tenantEventSessionToTenantEventSessionForm(rawres.data),
    }
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
