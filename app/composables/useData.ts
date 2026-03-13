export async function useFindUser(tenantId: number) {
    const { data } = await useApi(`/api/tenant/${tenantId}/user/find`, {
        transform: res => res.data,
    })
    const users = computed<User[]>(() => data.value?.users ?? [])
    return { users }
}

export async function useManageCustomAttribute(tenantId: number, eventId: number) {
    const { $api } = useNuxtApp()

    async function createCustomAttribute(data: CustomAttribute) {
        await $api(`/api/tenant/${tenantId}/event/${eventId}/attribute`, {
            method: 'POST',
            body: {
                name: data.name,
            },
        })
    }

    async function updateCustomAttribute(data: CustomAttribute) {
        await $api(`/api/tenant/${tenantId}/event/${eventId}/attribute/${data.custom_attribute_id}`, {
            method: 'PUT',
            body: {
                name: data.name,
            },
        })
    }

    async function deleteCustomAttribute(data: CustomAttribute) {
        await $api(`/api/tenant/${tenantId}/event/${eventId}/attribute/${data.custom_attribute_id}`, {
            method: 'DELETE',
        })
    }

    return { createCustomAttribute, updateCustomAttribute, deleteCustomAttribute }
}

export async function useFindCustomAttribute(tenantId: number, eventId: number) {
    const { data, refresh } = await useApi(`/api/tenant/${tenantId}/event/${eventId}/attribute/find`, {
        transform: res => res.data,
    })
    const customAttributes = computed<CustomAttribute[]>(() => data.value?.custom_attribute ?? [])
    return { customAttributes, refreshCustomAttributes: refresh }
}
