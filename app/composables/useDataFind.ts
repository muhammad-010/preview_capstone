export async function useUserFind(tenantId: number) {
    const { data } = await useApi(`/api/tenant/${tenantId}/user/find`, {
        transform: res => res.data,
    })
    const users = computed<User[]>(() => data.value?.users ?? [])
    return { users }
}

export async function useCustomAttrFind(tenantId: number, eventId: number) {
    const { data } = await useApi(`/api/tenant/${tenantId}/event/${eventId}/attribute/find`, {
        transform: res => res.data,
    })
    const customAttributes = computed<CustomAttribute[]>(() => data.value?.custom_attribute ?? [])
    return { customAttributes }
}
