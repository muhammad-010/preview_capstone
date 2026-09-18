<script setup lang="ts">
const route = useRoute()

interface StaffMember {
    name: string
    email: string
    role: string
    status: 'active' | 'inactive'
    isOwner: boolean
}

const staffList = ref<StaffMember[]>([
    { name: 'Rayendra Ogya Naga', email: 'rayendra@rawooh.id', role: 'Superadmin (pemilik)', status: 'active', isOwner: true },
    { name: 'Alya Kirana', email: 'alya@rawooh.id', role: 'Staf platform', status: 'active', isOwner: false },
    { name: 'Farhan Ilham', email: 'farhan@rawooh.id', role: 'Staf platform', status: 'inactive', isOwner: false },
])

const staffName = ref('')
const staffEmail = ref('')
const staffRole = ref('staff')

const page = ref(1)
const limit = ref(5)

const paginatedStaffList = computed(() => {
    const start = (page.value - 1) * limit.value
    return staffList.value.slice(start, start + limit.value)
})
const showAddModal = ref(false)
const adding = ref(false)
const showStatusModal = ref(false)
const statusTarget = ref<StaffMember | null>(null)

const roleOptions = [
    { label: 'Staf platform (akses penuh)', value: 'staff' },
]

function statusLabel(status: string) {
    return status === 'active' ? 'Aktif' : 'Nonaktif'
}

function statusColor(status: string) {
    return status === 'active' ? 'success' : 'neutral'
}

function openToggleStatus(staff: StaffMember) {
    statusTarget.value = staff
    showStatusModal.value = true
}

function confirmToggleStatus() {
    if (statusTarget.value) {
        statusTarget.value.status = statusTarget.value.status === 'active' ? 'inactive' : 'active'
    }
    showStatusModal.value = false
    statusTarget.value = null
}

async function addStaff() {
    if (!staffName.value || !staffEmail.value) return
    adding.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    staffList.value.push({
        name: staffName.value,
        email: staffEmail.value,
        role: 'Staf platform',
        status: 'active',
        isOwner: false,
    })
    staffName.value = ''
    staffEmail.value = ''
    adding.value = false
    showAddModal.value = false
    
    const toast = useToast()
    toast.add({
        title: 'Staf berhasil ditambahkan',
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
                color="primary"
                icon="lucide:plus"
                @click="showAddModal = true"
            >
                Tambah staf
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
                            v-for="staff in paginatedStaffList"
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
                                    v-else
                                    :color="staff.status === 'active' ? 'error' : 'success'"
                                    variant="outline"
                                    size="xs"
                                    @click="openToggleStatus(staff)"
                                >
                                    {{ staff.status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}
                                </UButton>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <template v-if="staffList.length > 0">
                <DataTablePagination
                    v-model:page="page"
                    v-model:limit="limit"
                    :total="staffList.length"
                    class="pb-4"
                />
            </template>
        </UCard>

        <!-- Add Modal -->
        <UModal
            v-model:open="showAddModal"
            title="Tambah Staf Baru"
            :ui="{ footer: 'justify-end' }"
        >
            <template #body>
                <div class="space-y-4">
                    <UFormField label="Nama Lengkap">
                        <UInput
                            v-model="staffName"
                            placeholder="John Doe"
                        />
                    </UFormField>
                    
                    <UFormField label="Email">
                        <UInput
                            v-model="staffEmail"
                            type="email"
                            placeholder="nama@rawooh.id"
                        />
                    </UFormField>

                    <UFormField label="Role">
                        <USelect
                            v-model="staffRole"
                            :items="roleOptions"
                        />
                    </UFormField>
                </div>
            </template>
            <template #footer>
                <UButton
                    color="neutral"
                    variant="ghost"
                    @click="showAddModal = false"
                >
                    Batal
                </UButton>
                <UButton
                    color="primary"
                    :loading="adding"
                    :disabled="!staffEmail || !staffName"
                    @click="addStaff"
                >
                    Tambah
                </UButton>
            </template>
        </UModal>

        <!-- Status Toggle Modal -->
        <ModalConfirmNegativeAction
            v-if="statusTarget?.status === 'active'"
            v-model:open="showStatusModal"
            :title="`Nonaktifkan ${statusTarget?.name || ''}`"
            :body="`Anda akan menonaktifkan akses staf ${statusTarget?.name} (${statusTarget?.email}). Staf ini tidak akan bisa mengakses panel superadmin lagi.`"
            confirm-label="Ya, nonaktifkan"
            @confirm="confirmToggleStatus"
        />
        <ModalConfirmPositiveAction
            v-else
            v-model:open="showStatusModal"
            :title="`Aktifkan ${statusTarget?.name || ''}`"
            :body="`Anda akan mengaktifkan kembali akses staf ${statusTarget?.name} (${statusTarget?.email}).`"
            confirm-label="Ya, aktifkan"
            @confirm="confirmToggleStatus"
        />
    </div>
</template>
