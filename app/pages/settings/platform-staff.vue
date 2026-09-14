<script setup lang="ts">
const route = useRoute()

interface StaffMember {
    name: string
    email: string
    role: string
    status: 'active' | 'invited' | 'revoked'
    isOwner: boolean
}

const staffList = ref<StaffMember[]>([
    { name: 'Rayendra Ogya Naga', email: 'rayendra@rawooh.id', role: 'Superadmin (pemilik)', status: 'active', isOwner: true },
    { name: 'Alya Kirana', email: 'alya@rawooh.id', role: 'Staf platform', status: 'active', isOwner: false },
    { name: 'Farhan Ilham', email: 'farhan@rawooh.id', role: 'Staf platform', status: 'invited', isOwner: false },
])

const inviteEmail = ref('')
const inviteRole = ref('staff')
const showRevokeModal = ref(false)
const revokeTarget = ref<StaffMember | null>(null)
const inviting = ref(false)

const roleOptions = [
    { label: 'Staf platform (akses penuh)', value: 'staff' },
]

function statusLabel(status: string) {
    switch (status) {
        case 'active': return 'Aktif'
        case 'invited': return 'Diundang · belum verifikasi'
        case 'revoked': return 'Dicabut'
        default: return status
    }
}

function statusColor(status: string) {
    switch (status) {
        case 'active': return 'success' as const
        case 'invited': return 'neutral' as const
        case 'revoked': return 'error' as const
        default: return 'neutral' as const
    }
}

function openRevoke(staff: StaffMember) {
    revokeTarget.value = staff
    showRevokeModal.value = true
}

function confirmRevoke() {
    if (revokeTarget.value) {
        revokeTarget.value.status = 'revoked'
    }
    showRevokeModal.value = false
    revokeTarget.value = null
}

async function sendInvite() {
    if (!inviteEmail.value) return
    inviting.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    staffList.value.push({
        name: inviteEmail.value.split('@')[0] || 'New Staff',
        email: inviteEmail.value,
        role: 'Staf platform',
        status: 'invited',
        isOwner: false,
    })
    inviteEmail.value = ''
    inviting.value = false
}

function resendInvite(staff: StaffMember) {
    // Mock resend
    const toast = useToast()
    toast.add({
        title: 'Undangan terkirim ulang',
        description: `Undangan dikirim ke ${staff.email}`,
        color: 'success',
    })
}

useHead({
    title: 'Staf Platform',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <!-- Add button -->
        <div class="flex justify-end mb-4">
            <UButton
                color="warning"
                icon="lucide:user-plus"
                @click="$refs.inviteSection?.scrollIntoView({ behavior: 'smooth' })"
            >
                Undang staf baru
            </UButton>
        </div>

        <!-- Staff Table -->
        <UCard>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-neutral-200">
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Nama
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th class="py-3 px-4" />
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="staff in staffList"
                            :key="staff.email"
                            class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                        >
                            <td class="py-3 px-4 font-medium">
                                {{ staff.name }}
                            </td>
                            <td class="py-3 px-4 text-neutral-500">
                                {{ staff.email }}
                            </td>
                            <td class="py-3 px-4">
                                {{ staff.role }}
                            </td>
                            <td class="py-3 px-4">
                                <UBadge
                                    :color="statusColor(staff.status)"
                                    variant="subtle"
                                >
                                    {{ statusLabel(staff.status) }}
                                </UBadge>
                            </td>
                            <td class="py-3 px-4 text-right">
                                <span
                                    v-if="staff.isOwner"
                                    class="text-neutral-300"
                                >
                                    —
                                </span>
                                <UButton
                                    v-else-if="staff.status === 'active'"
                                    color="error"
                                    variant="outline"
                                    size="xs"
                                    @click="openRevoke(staff)"
                                >
                                    Cabut akses
                                </UButton>
                                <UButton
                                    v-else-if="staff.status === 'invited'"
                                    color="neutral"
                                    variant="ghost"
                                    size="xs"
                                    @click="resendInvite(staff)"
                                >
                                    Kirim ulang undangan
                                </UButton>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </UCard>

        <USeparator class="my-6" />

        <!-- Invite Form -->
        <UCard
            ref="inviteSection"
            class="max-w-lg"
        >
            <template #header>
                <h3>Undang staf baru</h3>
            </template>

            <div class="space-y-4">
                <UFormField label="Email">
                    <UInput
                        v-model="inviteEmail"
                        type="email"
                        placeholder="nama@rawooh.id"
                    />
                </UFormField>

                <UFormField label="Role">
                    <USelect
                        v-model="inviteRole"
                        :items="roleOptions"
                    />
                    <template #hint>
                        <span class="text-xs text-neutral-400">
                            MVP: satu level akses; role granular dipertimbangkan berikutnya.
                        </span>
                    </template>
                </UFormField>

                <UButton
                    color="primary"
                    :loading="inviting"
                    :disabled="!inviteEmail"
                    @click="sendInvite"
                >
                    Kirim undangan
                </UButton>
            </div>
        </UCard>

        <!-- Revoke Modal -->
        <ModalConfirmNegativeAction
            v-model:open="showRevokeModal"
            :title="`Cabut akses ${revokeTarget?.name || ''}`"
            :body="`Anda akan mencabut akses staf ${revokeTarget?.name} (${revokeTarget?.email}). Staf ini tidak akan bisa mengakses panel superadmin lagi.`"
            confirm-label="Ya, cabut akses"
            @confirm="confirmRevoke"
        />
    </div>
</template>
