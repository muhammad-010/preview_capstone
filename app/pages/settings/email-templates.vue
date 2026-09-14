<script setup lang="ts">
const route = useRoute()

const templates = ref([
    {
        id: 'welcome',
        name: 'Welcome email · tenant baru',
        subject: 'Selamat datang di Rawooh, {{tenant_name}}!',
        body: 'Halo {{admin_name}},\n\nAkun tenant {{tenant_name}} pada tier {{plan_tier}} sudah aktif. Mulai buat event pertamamu sekarang.\n\nTim Rawooh',
        allowOverride: true,
    },
    {
        id: 'billing-due',
        name: 'Notifikasi tagihan jatuh tempo',
        subject: 'Tagihan {{tenant_name}} akan jatuh tempo',
        body: 'Halo {{admin_name}},\n\nTagihan bulan {{billing_month}} sebesar {{amount}} akan jatuh tempo pada {{due_date}}. Silakan lakukan pembayaran sebelum tanggal tersebut.\n\nTim Rawooh',
        allowOverride: false,
    },
    {
        id: 'readonly',
        name: 'Notifikasi read-only aktif',
        subject: 'Akun {{tenant_name}} dalam mode read-only',
        body: 'Halo {{admin_name}},\n\nAkun tenant {{tenant_name}} telah dialihkan ke mode read-only karena {{reason}}. Anda masih bisa melihat data tetapi tidak bisa membuat perubahan.\n\nTim Rawooh',
        allowOverride: false,
    },
    {
        id: 'reactivation',
        name: 'Notifikasi reaktivasi',
        subject: 'Akun {{tenant_name}} telah diaktifkan kembali',
        body: 'Halo {{admin_name}},\n\nAkun tenant {{tenant_name}} telah diaktifkan kembali. Semua fitur sudah bisa digunakan seperti biasa.\n\nTim Rawooh',
        allowOverride: true,
    },
])

const selectedTemplateId = ref('welcome')
const selectedTemplate = computed(() => templates.value.find(t => t.id === selectedTemplateId.value))

const editSubject = ref('')
const editBody = ref('')
const editOverride = ref(false)

watch(selectedTemplateId, () => {
    if (selectedTemplate.value) {
        editSubject.value = selectedTemplate.value.subject
        editBody.value = selectedTemplate.value.body
        editOverride.value = selectedTemplate.value.allowOverride
    }
}, { immediate: true })

const saving = ref(false)

async function saveTemplate() {
    saving.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (selectedTemplate.value) {
        selectedTemplate.value.subject = editSubject.value
        selectedTemplate.value.body = editBody.value
        selectedTemplate.value.allowOverride = editOverride.value
    }
    saving.value = false
}

useHead({
    title: 'Template Email',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <!-- Template List -->
            <UCard :ui="{ body: 'p-0!' }">
                <template #header>
                    <h3>Template</h3>
                </template>

                <div class="flex flex-col">
                    <button
                        v-for="tpl in templates"
                        :key="tpl.id"
                        class="text-left px-5 py-3 text-sm border-b border-neutral-100 transition-colors cursor-pointer"
                        :class="{
                            'bg-primary-50 font-semibold text-primary-900': selectedTemplateId === tpl.id,
                            'text-neutral-500 hover:bg-neutral-50': selectedTemplateId !== tpl.id,
                        }"
                        @click="selectedTemplateId = tpl.id"
                    >
                        {{ tpl.name }}
                    </button>
                </div>
            </UCard>

            <!-- Template Editor -->
            <UCard v-if="selectedTemplate">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3>{{ selectedTemplate.name }}</h3>
                        <div class="flex items-center gap-2">
                            <small class="text-neutral-500">Tenant boleh override</small>
                            <UToggle v-model="editOverride" />
                        </div>
                    </div>
                </template>

                <div class="space-y-4">
                    <UFormField label="Subjek">
                        <UInput v-model="editSubject" />
                    </UFormField>

                    <UFormField label="Isi email">
                        <UTextarea
                            v-model="editBody"
                            :rows="8"
                            autoresize
                        />
                    </UFormField>

                    <div class="rounded-lg border border-dashed border-neutral-300 p-3 bg-neutral-50">
                        <small class="text-neutral-500">
                            Variabel yang tersedia:
                            <code class="text-primary text-xs">&#123;&#123;tenant_name&#125;&#125;</code>,
                            <code class="text-primary text-xs">&#123;&#123;admin_name&#125;&#125;</code>,
                            <code class="text-primary text-xs">&#123;&#123;plan_tier&#125;&#125;</code>
                        </small>
                    </div>

                    <div class="flex gap-3">
                        <UButton
                            color="primary"
                            :loading="saving"
                            @click="saveTemplate"
                        >
                            Simpan template
                        </UButton>
                        <UButton
                            color="neutral"
                            variant="ghost"
                        >
                            Lihat preview
                        </UButton>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>
