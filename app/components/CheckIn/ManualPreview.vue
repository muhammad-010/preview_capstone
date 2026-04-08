<script setup lang="ts">
defineProps<{
    title?: string
    buttonLabel?: string
}>()

const state = reactive({ phoneNumber: '' })
const phoneNumberLoading = ref(false)
</script>

<template>
    <div>
        <MiscLoadingOverlay :loading="phoneNumberLoading">
            <UCard>
                <template #header>
                    <div>
                        <h2 class="text-highlighted font-semibold">
                            {{ title ?? 'Find Participant By Phone Number' }}
                        </h2>
                    </div>
                </template>

                <UForm
                    :state="state"
                    class="flex flex-col items-center"
                >
                    <UFormField
                        label="Phone Number"
                        name="phone_number"
                        required
                        class="text-lg mb-8"
                    >
                        <UInput
                            v-model="state.phoneNumber"
                            :ui="{
                                base: 'px-4 py-4 text-5xl gap-2',
                            }"
                        >
                            <template #trailing>
                                <UButton
                                    v-if="state.phoneNumber"
                                    color="neutral"
                                    variant="link"
                                    size="xl"
                                    icon="lucide:x"
                                />
                            </template>
                        </UInput>
                    </UFormField>
                    <button
                        type="submit"
                        :disabled="phoneNumberLoading"
                        class="cursor-pointer bg-primary text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                    >
                        {{ buttonLabel ?? 'Find Participant' }}
                    </button>
                </UForm>
            </UCard>
        </MiscLoadingOverlay>
    </div>
</template>
