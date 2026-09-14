<script setup lang="ts">
const route = useRoute()

// Password rules
const passwordMinLength = ref(10)
const requireUpperLower = ref(true)
const requireNumbers = ref(true)
const requireSpecialChars = ref(false)

// Session rules
const autoLogoutMinutes = ref(30)
const forceReloginAfterReset = ref(true)

const saving = ref(false)

async function savePolicy() {
    saving.value = true
    // Mock save
    await new Promise(resolve => setTimeout(resolve, 1000))
    saving.value = false
}

useHead({
    title: 'Kebijakan Keamanan',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Password Rules -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3>Aturan password</h3>
                        <UBadge
                            color="success"
                            variant="subtle"
                        >
                            Berlaku global
                        </UBadge>
                    </div>
                </template>

                <div class="space-y-5">
                    <UFormField label="Panjang minimum">
                        <UInput
                            v-model.number="passwordMinLength"
                            type="number"
                            :min="6"
                            :max="32"
                        >
                            <template #trailing>
                                <span class="text-xs text-neutral-400">karakter</span>
                            </template>
                        </UInput>
                    </UFormField>

                    <UFormField label="Wajib kombinasi karakter">
                        <div class="space-y-3 mt-1">
                            <label class="flex items-center gap-3 text-sm cursor-pointer">
                                <UCheckbox v-model="requireUpperLower" />
                                Huruf besar & kecil
                            </label>
                            <label class="flex items-center gap-3 text-sm cursor-pointer">
                                <UCheckbox v-model="requireNumbers" />
                                Angka
                            </label>
                            <label class="flex items-center gap-3 text-sm cursor-pointer">
                                <UCheckbox v-model="requireSpecialChars" />
                                Karakter khusus (!@#$)
                            </label>
                        </div>
                    </UFormField>
                </div>
            </UCard>

            <!-- Session Login -->
            <UCard>
                <template #header>
                    <h3>Sesi login</h3>
                </template>

                <div class="space-y-5">
                    <UFormField label="Auto-logout setelah tidak aktif">
                        <UInput
                            v-model.number="autoLogoutMinutes"
                            type="number"
                            :min="5"
                            :max="480"
                        >
                            <template #trailing>
                                <span class="text-xs text-neutral-400">menit</span>
                            </template>
                        </UInput>
                    </UFormField>

                    <div class="flex items-center justify-between py-2">
                        <div>
                            <p class="text-sm font-medium">
                                Wajib re-login setelah reset password
                            </p>
                            <small class="text-neutral-400">
                                Semua sesi aktif akan di-terminate setelah password di-reset
                            </small>
                        </div>
                        <UToggle v-model="forceReloginAfterReset" />
                    </div>

                    <div class="rounded-lg border border-dashed border-neutral-300 p-3 bg-neutral-50">
                        <small class="text-neutral-500">
                            Kebijakan ini berlaku satu aturan untuk semua tenant. Override per tenant/tier belum tersedia.
                        </small>
                    </div>
                </div>
            </UCard>
        </div>

        <div class="mt-6">
            <UButton
                color="primary"
                :loading="saving"
                @click="savePolicy"
            >
                Simpan kebijakan — berlaku ke semua tenant
            </UButton>
        </div>
    </div>
</template>
