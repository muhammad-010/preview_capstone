export default defineEventHandler(async (event): Promise<FetchResult> => {
    const method = 'POST'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const path = `/tenant/${tenantId}/event/${eventId}/participant/bulk`
    const body = await readMultipartFormData(event)

    const res: FetchResult = await api(event, method, path, {
        body,
        headers: {
            ['Content-Type']: 'multipart/form-data',
        },
    })
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
