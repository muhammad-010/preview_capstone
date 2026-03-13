export async function useTenantInfo(tenantId: number) {
    const { data } = await useApi(`/api/tenant/${tenantId}`, {
        transform: res => res.data,
    })
    const tenant = computed<TenantForm>(() => data.value ?? {} as TenantForm)

    return { tenant }
}

export async function useMemberInfo(tenantId: number, userId: number) {
    const { data } = await useApi(`/api/tenant/${tenantId}/user/${userId}`, {
        transform: res => res.data,
    })
    const member = computed<UserForm>(() => data.value ?? {} as UserForm)

    return { member }
}

export async function useEventInfo(tenantId: number, eventId: number) {
    const { data } = await useApi(`/api/tenant/${tenantId}/event/${eventId}`, {
        transform: res => res.data,
    })
    const event = computed<TenantEventForm>(() => data.value ?? {} as TenantEventForm)

    return { event }
}

export async function useParticipantInfo(tenantId: number, eventId: number, participantId: number) {
    const { data } = await useApi(`/api/tenant/${tenantId}/event/${eventId}/participant/${participantId}`, {
        transform: res => res.data,
    })
    const participant = computed<ParticipantForm>(() => data.value ?? {} as ParticipantForm)

    return { participant }
}
