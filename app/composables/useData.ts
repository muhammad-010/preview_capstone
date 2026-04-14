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

export async function useFindParticipantSession(tenantId: number, eventId: number, participantId: number) {
    const { data, refresh } = await useApi(`/api/tenant/${tenantId}/event/${eventId}/participant/${participantId}/session/find`, {
        transform: res => res.data,
    })
    const participantSession = computed<TenantEventSession[]>(() => data.value?.event_session ?? [])
    return { participantSession, refreshParticipantSession: refresh }
}
