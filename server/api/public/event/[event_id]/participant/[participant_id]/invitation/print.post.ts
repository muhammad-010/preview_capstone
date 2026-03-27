export default defineEventHandler(async (event): Promise<PrintQRResult> => {
    const method = 'POST'
    const eventId = getRouterParam(event, 'event_id')
    const participantId = getRouterParam(event, 'participant_id')
    const path = `/public/event/${eventId}/participant/${participantId}/invitation/print`
    const body = await readBody(event)

    const res: PrintQRResult = await api(event, method, path, {
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
