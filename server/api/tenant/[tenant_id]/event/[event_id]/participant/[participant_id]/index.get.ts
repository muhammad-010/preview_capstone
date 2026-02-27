export default defineEventHandler(async (event): Promise<ParticipantFormResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const eventId = getRouterParam(event, 'event_id')
    const participantId = getRouterParam(event, 'participant_id')
    const path = `/tenant/${tenantId}/event/${eventId}/participant/${participantId}`

    const rawres: ParticipantDetailresult = await api(event, method, path, {})
    const res = {
        ...rawres,
        data: participantToParticipantForm(rawres.data),
    }
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
