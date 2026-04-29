<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()

const { data, refresh } = useApi(`/api/tenant/${props.tenantId}/event/${props.eventId}/setting`, {
    transform: res => res.data,
})
const settings = computed(() => {
    const res = cloneObject(TENANT_EVENT_SETTINGS)
    if (!data.value) return res

    const dataval = data.value
    for (const key in dataval) {
        if (!Object.hasOwn(dataval, key)) continue
        const element = dataval[key as TenantEventSettingKeys]
        res[key as TenantEventSettingKeys]!.value = element.value
    }
    return res
})
defineExpose({ refresh })

const loading = ref(false)
async function changeSetting(key: string, value: boolean) {
    if (!(TENANT_EVENT_SETTING_DROPDOWN as unknown as string).includes(key)) return

    loading.value = true
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/setting`, {
            method: 'PUT',
            body: {
                [key]: { value },
            },
        })
        if (data.success) {
            successToast({ description: 'Event setting has been updated' })
            refresh()
            emit(EMIT_DETAIL_REFRESH)
        }
        else {
            successToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to update event setting' })
    }
    loading.value = false
}
</script>

<template>
    <UCard :ui="{ body: 'p-0!' }">
        <div
            v-for="(val, key) in settings"
            :key="key"
            class="border-y first:border-t-0 last:border-b-0 border-neutral-950/20 dark:border-neutral-50/20 p-4 sm:p-6 flex justify-between"
        >
            <div>
                <h4>
                    {{ val.title }}
                </h4>
                <span class="text-sm text-muted">
                    {{ val.desc }}
                </span>
            </div>
            <div class="my-auto">
                <USwitch
                    :model-value="val.value"
                    size="xl"
                    :loading="loading"
                    :ui="{ base: 'cursor-pointer' }"
                    @update:model-value="(value) => changeSetting(`${key}`, value)"
                />
            </div>
        </div>
    </UCard>
</template>
