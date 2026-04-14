export default defineEventHandler(async (event): Promise<TenantEventSessionFound> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const participantId = getRouterParam(event, 'participant_id')
    const path = `/tenant/${tenantId}/event/${eventId}/participant/${participantId}/session/find`

    const res: TenantEventSessionFound = await api(event, method, path, {})
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
