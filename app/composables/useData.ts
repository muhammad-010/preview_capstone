export async function useFindUser(tenantId: number) {
    const { data, refresh } = await useApi(`/api/tenant/${tenantId}/user/find`, {
        transform: res => res.data,
    })
    const users = computed<User[]>(() => data.value?.users ?? [])
    return { users, refreshUsers: refresh }
}

export async function useFindCustomAttribute(tenantId: number, eventId: number) {
    const { data, refresh } = await useApi(`/api/tenant/${tenantId}/event/${eventId}/attribute/find`, {
        transform: res => res.data,
    })
    const customAttributes = computed<CustomAttribute[]>(() => data.value?.custom_attribute ?? [])
    return { customAttributes, refreshCustomAttributes: refresh }
}

export async function useFindEventSession(tenantId: number, eventId: number) {
    const { data, clear, refresh } = await useApi(`/api/tenant/${tenantId}/event/${eventId}/session/find`, {
        transform: res => res.data,
    })
    const participantSession = computed<TenantEventSession[]>(() => data.value?.event_session ?? [])
    return { participantSession, clearParticipantSession: clear, refreshParticipantSession: refresh }
}

export async function useRawFindEventSession(tenantId: number, eventId: number) {
    const { $api } = useNuxtApp()
    const { data } = await $api(`/api/tenant/${tenantId}/event/${eventId}/session/find`)

    return data.event_session
}

export async function useFindParticipantSession(tenantId: number, eventId: number, participantId: number) {
    const { data, clear, refresh } = await useApi(`/api/tenant/${tenantId}/event/${eventId}/participant/${participantId}/session/find`, {
        transform: res => res.data,
    })
    const participantSession = computed<TenantEventSession[]>(() => data.value?.event_session ?? [])
    return { participantSession, clearParticipantSession: clear, refreshParticipantSession: refresh }
}

export async function useRawFindTicketAbility(tenantId: number, eventId: number, ticketId: number) {
    const { $api } = useNuxtApp()
    const { data } = await $api(`/api/tenant/${tenantId}/event/${eventId}/ticket/${ticketId}/ability?page=1&limit=10`)

    const eventSessions = data.ticket_ability.map(e => sessionFromTicketAbility(e)).filter(e => e !== undefined)
    return eventSessions
}

// BELOW ARE DEPRECATED

export async function useRawFindParticipantSession(tenantId: number, eventId: number, participantId: number) {
    const { $api } = useNuxtApp()
    const { data } = await $api(`/api/tenant/${tenantId}/event/${eventId}/participant/${participantId}/session/find`)

    return data.event_session
}
