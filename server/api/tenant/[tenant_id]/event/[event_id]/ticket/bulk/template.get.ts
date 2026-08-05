export default defineEventHandler(async (event): Promise<TenantEventTicketImportTemplateResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const path = `/tenant/${tenantId}/event/${eventId}/ticket/bulk/template`

    const res: TenantEventTicketImportTemplateResult = await api(event, method, path)
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
