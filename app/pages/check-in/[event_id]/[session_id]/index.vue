<script setup lang="ts">
const route = useRoute()
const eventId = Number(route.params.event_id)
const sessionId = Number(route.params.session_id)
const { tenantId } = useUserState()

const checkInSuccessDialog = ref(false)
const checkInFailedDialog = ref(false)
const targetParticipant = ref<ParticipantCheckInTarget>({
    id: 0,
    sessionId: 0,
    sessionName: '',
    name: '',
    maxAttendance: 0,
    customAttributes: [],
})
const errorMessage = ref<string>('')

const { data } = await useApi(`/api/tenant/${tenantId.value}/event/${eventId}/detail`, {
    transform: res => ({
        ...res.data,
    }),
})
const event = computed<TenantEvent>(() => data.value ?? {} as TenantEvent)

const { data: templateData } = await useApi(`/api/tenant/${tenantId.value}/event/${eventId}/session/${sessionId}/template/render/scanqr`, {
    transform: res => ({
        ...res.data,
    }),
})
const template = computed(() => templateData.value)
const background = computed<Record<Breakpoint, string | undefined>>(() => {
    const res = {} as Record<Breakpoint, string | undefined>
    if (!template.value || !template.value.variants) return res

    for (const bp of BREAKPOINTS) {
        const variant = template.value.variants.find(v => v.slug === bp)
        res[bp] = variant?.background_image_url || undefined
    }

    return res
})
const blocks = computed<{
    customBlocks: ElementBlock[]
    staticBlocks: ElementBlock[]
}>(() => {
    if (template.value) {
        return parseTemplateVariants(template.value.variants, CHECK_IN_VALID_BREAKPOINTS)
    }
    else {
        return { customBlocks: [], staticBlocks: [] }
    }
})

const { data: fontData } = await useApi(`/api/editor/font`, {
    transform: res => ({
        ...res.data,
    }),
})
const fonts = computed(() => fontData.value?.font || [])

useHead({
    title: computed(() => `Check In - ${event.value ? event.value.name : 'Event'}`),
})
definePageMeta({
    layout: false,
})
</script>

<template>
    <div>
        <NuxtLayout
            name="scan"
            :sm-background="background[BREAKPOINT_SM]"
            :md-background="background[BREAKPOINT_MD]"
            :lg-background="background[BREAKPOINT_LG]"
            :xl-background="background[BREAKPOINT_XL]"
        >
            <PageCheckInMain
                v-model:open-success="checkInSuccessDialog"
                v-model:open-failed="checkInFailedDialog"
                v-model:participant="targetParticipant"
                v-model:error-message="errorMessage"
                :tenant-id="tenantId"
                :event-id="eventId"
                :session-id="sessionId"
                :custom-block-settings="blocks.customBlocks"
                :static-block-settings="blocks.staticBlocks"
                :valid-fonts="fonts"
            />

            <ModalCheckInSuccess
                v-model:open="checkInSuccessDialog"
                :event="event.name"
                :participant="targetParticipant.name"
            >
                <template #title>
                    <h3>Check In Success!</h3>
                </template>
                <template #subtitle>
                    <h2>Name: {{ targetParticipant.name }}</h2>
                    <h2>Max Pax: {{ targetParticipant.maxAttendance }}</h2>
                    <template v-if="targetParticipant.customAttributes.length">
                        <h2
                            v-for="(attr, id) in targetParticipant.customAttributes"
                            :key="id"
                        >
                            {{ attr.name }}: {{ attr.value }}
                        </h2>
                    </template>
                </template>
            </ModalCheckInSuccess>

            <ModalCheckInFailed
                v-model:open="checkInFailedDialog"
                :message="errorMessage"
            />
        </NuxtLayout>
    </div>
</template>
