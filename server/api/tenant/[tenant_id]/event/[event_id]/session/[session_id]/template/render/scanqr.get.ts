export default defineEventHandler(async (event): Promise<ScanPageTemplateResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const sessionId = getRouterParam(event, 'session_id')
    const path = `/tenant/${tenantId}/event/${eventId}/session/${sessionId}/template/render/scanqr`

    const res: ScanPageTemplateResult = await api(event, method, path, {})
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
