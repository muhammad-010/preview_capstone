export default defineEventHandler(async (event): Promise<FetchResult> => {
    const method = 'PUT'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const templateId = getRouterParam(event, 'template_id')
    const body = await readBody(event)
    const path = `/tenant/${tenantId}/event/${eventId}/template/${templateId}`

    const res: FetchResult = await api(event, method, path, {
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

