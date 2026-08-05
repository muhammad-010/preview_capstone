export default defineEventHandler(async (event): Promise<FetchResult> => {
    const method = 'POST'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const path = `/tenant/${tenantId}/event/${eventId}/ticket/bulk`
    const rawbody = await readMultipartFormData(event)
    const file = rawbody?.[0]
    if (!file) {
        throw createError({
            statusCode: 400,
            message: 'No file provided',
        })
    }
    const body = new FormData()
    body.append('file', new Blob([new Uint8Array(file.data)]), file.filename)

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
