export default defineEventHandler(async (event): Promise<TenantEventTicketPrintQRResult> => {
    const method = 'POST'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const path = `/tenant/${tenantId}/event/${eventId}/ticket/print`
    const body = await readBody(event)

    const res: TenantEventTicketPrintQRResult = await api(event, method, path, {
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
