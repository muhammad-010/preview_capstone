export default defineEventHandler(async (event): Promise<ParticipantListResult> => {
    const method = 'GET'
    const eventId = getRouterParam(event, 'event_id')
    const path = `/public/event/${eventId}/participant`
    const query = getQuery(event)

    const res: ParticipantListResult = await apiNoAuth(event, method, path, {
        query,
    })
    if (res.success) {
        res.data.participant = res.data.participant.map((participant) => {
            return {
                ...participant,
                ticket_url: process.env.EXTERNAL_API_URL + `/files/storage/event/${eventId}/participant/invitation/${participant.participant_id}.png`,
            }
        })
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
