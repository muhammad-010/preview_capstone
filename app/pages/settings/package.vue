<script setup lang="ts">
const route = useRoute()
const toast = useToast()

// ---------- Feature catalog (from PRD) ----------
interface FeatureAttr {
    name: string
    limit: boolean
}
interface FeatureSub {
    name: string
    attrs: FeatureAttr[]
}
interface FeatureModule {
    module: string
    subs: FeatureSub[]
}

const FEATURES: FeatureModule[] = [
    {
        module: 'Event Index', subs: [
            { name: 'Create', attrs: [{ name: 'Create Event', limit: true }] },
            { name: 'Read', attrs: [{ name: 'View Event', limit: false }] },
            { name: 'Update', attrs: [{ name: 'Update Event', limit: false }] },
            { name: 'Delete', attrs: [{ name: 'Delete Event', limit: false }] },
        ],
    },
    {
        module: 'Event Details', subs: [
            {
                name: 'Store', attrs: [
                    { name: 'Create Store', limit: false }, { name: 'Edit Store', limit: false },
                    { name: 'Add Products', limit: true }, { name: 'Delete Products', limit: false },
                ],
            },
            {
                name: 'Session', attrs: [
                    { name: 'Create Session', limit: true }, { name: 'Edit Session', limit: false }, { name: 'Delete Session', limit: false },
                ],
            },
            {
                name: 'Add Attendees', attrs: [
                    { name: 'Single Add Attendees', limit: true }, { name: 'Bulk Add Attendees', limit: false },
                ],
            },
            {
                name: 'Custom Attribute', attrs: [
                    { name: 'Add Custom Attribute (Default - FreeText)', limit: true },
                    { name: 'Add Custom Attribute Data Type Number', limit: true },
                    { name: 'Add Custom Attribute Data Type Single Option', limit: true },
                    { name: 'Add Custom Attribute Data Type Multiple Option', limit: true },
                    { name: 'Add Custom Attribute Customize Icon', limit: true },
                    { name: 'Edit Custom Attribute', limit: false },
                    { name: 'Delete Custom Attribute', limit: false },
                ],
            },
        ],
    },
    {
        module: 'Key Visuals', subs: [
            {
                name: 'Online Editor', attrs: [
                    { name: 'Custom QR Invitation', limit: false },
                    { name: 'Custom Scan QR', limit: false },
                    { name: 'Custom Certificate', limit: false },
                ],
            },
        ],
    },
    {
        module: 'Members', subs: [
            { name: 'Add Member', attrs: [{ name: 'Add Member', limit: true }] },
        ],
    },
    {
        module: 'Order', subs: [
            { name: 'Order Index', attrs: [{ name: 'View Data Order', limit: false }] },
        ],
    },
    {
        module: 'Distribution', subs: [
            { name: 'View Distribution', attrs: [{ name: 'View distribution data', limit: false }] },
            {
                name: 'Create Distribute', attrs: [
                    { name: 'Invitation - Channel WA', limit: true },
                    { name: 'Invitation - Channel Email', limit: true },
                    { name: 'Certificate - Channel Email', limit: true },
                ],
            },
        ],
    },
    {
        module: 'Reports', subs: [
            { name: 'Attendance', attrs: [{ name: 'View Report Attendance', limit: false }, { name: 'Export Report Attendance', limit: false }] },
            { name: 'Revenue', attrs: [{ name: 'View Revenue Report', limit: false }, { name: 'Export Revenue Report', limit: false }] },
        ],
    },
]

const DEFAULT_LIMITS: Record<string, number> = { basic: 5, pro: 50, enterprise: 0 }

// ---------- State types ----------
interface AttrState {
    enabled: boolean
    limit: number | null
}
interface SubState {
    enabled: boolean
    attrs: Record<string, AttrState>
}
interface ModuleState {
    enabled: boolean
    subs: Record<string, SubState>
}
interface Package {
    id: string
    name: string
    status: 'active' | 'inactive'
    state: Record<string, ModuleState>
}

function buildDefaultState(tierKey: string): Record<string, ModuleState> {
    const st: Record<string, ModuleState> = {}
    FEATURES.forEach((m) => {
        st[m.module] = { enabled: true, subs: {} }
        m.subs.forEach((s) => {
            st[m.module].subs[s.name] = { enabled: true, attrs: {} }
            s.attrs.forEach((a) => {
                st[m.module].subs[s.name].attrs[a.name] = {
                    enabled: true,
                    limit: a.limit ? (DEFAULT_LIMITS[tierKey] ?? 5) : null,
                }
            })
        })
    })
    return st
}

// ---------- Reactive state ----------
const packages = ref<Package[]>([
    { id: 'basic', name: 'Basic', status: 'active', state: buildDefaultState('basic') },
    { id: 'pro', name: 'Pro', status: 'active', state: buildDefaultState('pro') },
    { id: 'enterprise', name: 'Enterprise', status: 'active', state: buildDefaultState('enterprise') },
])

const currentPkgId = ref('basic')
const searchQuery = ref('')
const moduleFilter = ref('Semua Module')
const collapsed = ref<Record<string, boolean>>({})
const manageModalOpen = ref(false)
const newPkgName = ref('')
const deleteConfirmOpen = ref(false)
const pendingDeleteId = ref<string | null>(null)

// ---------- Computed ----------
const currentPkg = computed(() => packages.value.find(p => p.id === currentPkgId.value)!)

const moduleOptions = computed(() => [
    'Semua Module',
    ...FEATURES.map(m => m.module),
])

function countEnabled(pkg: Package): number {
    let n = 0
    Object.values(pkg.state).forEach(m =>
        Object.values(m.subs).forEach(s =>
            Object.values(s.attrs).forEach((a) => {
                if (a.enabled) n++
            }),
        ),
    )
    return n
}

function totalAttrs(): number {
    let n = 0
    FEATURES.forEach(m => m.subs.forEach(s => n += s.attrs.length))
    return n
}

// ---------- Filtered tree ----------
const filteredTree = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    const modF = moduleFilter.value
    const isFiltered = modF && modF !== 'Semua Module'
    const result: { module: FeatureModule, subs: { sub: FeatureSub, attrs: FeatureAttr[] }[] }[] = []

    FEATURES.forEach((m) => {
        if (isFiltered && modF !== m.module) return
        
        const matches = (txt: string) => txt.toLowerCase().includes(q)
        
        const subsToShow = m.subs
            .map((s) => {
                const attrsToShow = s.attrs.filter(a =>
                    !q || matches(a.name) || matches(s.name) || matches(m.module),
                )
                return { sub: s, attrs: attrsToShow }
            })
            .filter(x => x.attrs.length > 0)

        if (subsToShow.length > 0) {
            result.push({ module: m, subs: subsToShow })
        }
    })
    return result
})

// ---------- Actions ----------
function toggleModule(moduleName: string) {
    const pkg = currentPkg.value
    pkg.state[moduleName].enabled = !pkg.state[moduleName].enabled
}

function toggleSub(moduleName: string, subName: string) {
    const pkg = currentPkg.value
    pkg.state[moduleName].subs[subName].enabled = !pkg.state[moduleName].subs[subName].enabled
}

function toggleAttr(moduleName: string, subName: string, attrName: string) {
    const pkg = currentPkg.value
    pkg.state[moduleName].subs[subName].attrs[attrName].enabled = !pkg.state[moduleName].subs[subName].attrs[attrName].enabled
}

function isModuleDimmed(moduleName: string): boolean {
    return currentPkg.value.status === 'inactive'
}

function isSubDimmed(moduleName: string): boolean {
    return !currentPkg.value.state[moduleName].enabled || currentPkg.value.status === 'inactive'
}

function isAttrDimmed(moduleName: string, subName: string): boolean {
    return !currentPkg.value.state[moduleName].enabled
        || !currentPkg.value.state[moduleName].subs[subName].enabled
        || currentPkg.value.status === 'inactive'
}

function toggleCollapse(moduleName: string) {
    collapsed.value[moduleName] = !collapsed.value[moduleName]
}

function displayLimit(val: number | null): string {
    if (val === null) return ''
    return val === 0 ? '∞' : String(val)
}

// ---------- Manage Package ----------
function renamePkg(id: string, val: string) {
    const pkg = packages.value.find(p => p.id === id)
    if (pkg) pkg.name = val.trim() || pkg.name
}

function togglePkgStatus(id: string) {
    const pkg = packages.value.find(p => p.id === id)
    if (pkg) {
        pkg.status = pkg.status === 'active' ? 'inactive' : 'active'
    }
}

function requestDeletePkg(id: string) {
    if (packages.value.length <= 1) {
        toast.add({ title: 'Minimal harus ada 1 package.', color: 'warning' })
        return
    }
    pendingDeleteId.value = id
    deleteConfirmOpen.value = true
}

function confirmDeletePkg() {
    if (!pendingDeleteId.value) return
    packages.value = packages.value.filter(p => p.id !== pendingDeleteId.value)
    if (currentPkgId.value === pendingDeleteId.value) {
        currentPkgId.value = packages.value[0].id
    }
    deleteConfirmOpen.value = false
    pendingDeleteId.value = null
    toast.add({ title: 'Package berhasil dihapus.', color: 'success' })
}

function addPackage() {
    const name = newPkgName.value.trim()
    if (!name) return
    const id = 'pkg_' + Date.now()
    packages.value.push({ id, name, status: 'active', state: buildDefaultState('basic') })
    newPkgName.value = ''
    toast.add({ title: `Package "${name}" berhasil ditambahkan.`, color: 'success' })
}

function saveChanges() {
    toast.add({ title: 'Perubahan berhasil disimpan.', color: 'success' })
}

useHead({ title: 'Konfigurasi Package' })
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8 space-y-6">
        <!-- Header actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <p class="text-sm text-neutral-500">
                    Atur fitur mana yang aktif untuk tiap package, dan limit-nya bila dinamis.
                </p>
            </div>
            <div class="flex gap-2">
                <UButton
                    color="neutral"
                    variant="outline"
                    icon="lucide:settings-2"
                    @click="manageModalOpen = true"
                >
                    Manage Package
                </UButton>
                <UButton
                    color="primary"
                    icon="lucide:save"
                    @click="saveChanges"
                >
                    Simpan
                </UButton>
            </div>
        </div>

        <!-- Package Tabs -->
        <div class="flex flex-wrap gap-2">
            <UButton
                v-for="pkg in packages"
                :key="pkg.id"
                :color="pkg.id === currentPkgId ? 'primary' : 'neutral'"
                :variant="pkg.id === currentPkgId ? 'solid' : 'outline'"
                size="sm"
                :class="{ 'opacity-50': pkg.status === 'inactive' }"
                @click="currentPkgId = pkg.id"
            >
                <span
                    class="inline-block size-2 rounded-full mr-1"
                    :class="pkg.status === 'active' ? 'bg-success' : 'bg-warning'"
                />
                {{ pkg.name }}
                <span
                    v-if="pkg.status === 'inactive'"
                    class="text-xs opacity-75"
                >(nonaktif)</span>
            </UButton>
        </div>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3">
            <UInput
                v-model="searchQuery"
                icon="lucide:search"
                placeholder="Cari fitur, sub module, atau module..."
                class="flex-1"
            />
            <USelect
                v-model="moduleFilter"
                :items="moduleOptions"
                class="w-full sm:w-56"
            />
        </div>

        <!-- Feature Tree -->
        <UCard :ui="{ body: 'p-0' }">
            <!-- Tree Header -->
            <div class="grid grid-cols-[1fr_100px_160px] px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
                <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Fitur</span>
                <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</span>
                <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Limit</span>
            </div>

            <!-- Tree Body -->
            <div v-if="filteredTree.length === 0" class="py-12 text-center text-neutral-400 text-sm">
                Tidak ada fitur yang cocok dengan pencarian / filter.
            </div>

            <template v-for="(group, groupIdx) in filteredTree" :key="group.module.module">
                <!-- Module Row -->
                <div
                    class="grid grid-cols-[1fr_100px_160px] items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-800/60 border-l-3 border-l-primary cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    :class="{ 'opacity-40': isModuleDimmed(group.module.module) }"
                    @click="toggleCollapse(group.module.module)"
                >
                    <div class="flex items-center gap-2">
                        <UIcon
                            :name="collapsed[group.module.module] ? 'lucide:chevron-right' : 'lucide:chevron-down'"
                            class="size-4 text-neutral-400 dark:text-neutral-500 shrink-0"
                        />
                        <span class="font-bold text-sm text-neutral-900 dark:text-white">{{ group.module.module }}</span>
                    </div>
                    <div @click.stop>
                        <USwitch
                            :model-value="currentPkg.state[group.module.module].enabled"
                            :disabled="currentPkg.status === 'inactive'"
                            color="success"
                            @update:model-value="toggleModule(group.module.module)"
                        />
                    </div>
                    <div />
                </div>

                <!-- Sub + Attr rows (collapsible) -->
                <template v-if="!collapsed[group.module.module]">
                    <template v-for="(subGroup, subIdx) in group.subs" :key="subGroup.sub.name">
                        <!-- Sub Row -->
                        <div
                            class="grid grid-cols-[1fr_100px_160px] items-center px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800/60 border-l-3 border-l-primary/30 hover:bg-primary-50/30 dark:hover:bg-primary-900/20 transition-colors"
                            :class="[
                                { 'opacity-40': isSubDimmed(group.module.module) },
                                subIdx % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/40 dark:bg-neutral-800/30',
                            ]"
                        >
                            <div class="pl-6 flex items-center gap-2">
                                <UIcon name="lucide:folder" class="size-3.5 text-primary/50 shrink-0" />
                                <span class="font-semibold text-sm text-neutral-700 dark:text-neutral-200">{{ subGroup.sub.name }}</span>
                            </div>
                            <div>
                                <USwitch
                                    :model-value="currentPkg.state[group.module.module].subs[subGroup.sub.name].enabled"
                                    :disabled="isSubDimmed(group.module.module)"
                                    color="success"
                                    @update:model-value="toggleSub(group.module.module, subGroup.sub.name)"
                                />
                            </div>
                            <div />
                        </div>

                        <!-- Attr Rows -->
                        <div
                            v-for="(attr, attrIdx) in subGroup.attrs"
                            :key="attr.name"
                            class="grid grid-cols-[1fr_100px_160px] items-center px-4 py-2 border-b border-neutral-50 dark:border-neutral-800/30 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                            :class="[
                                { 'opacity-40': isAttrDimmed(group.module.module, subGroup.sub.name) },
                                attrIdx % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-800/40',
                            ]"
                        >
                            <div class="pl-14 flex items-center gap-2">
                                <span class="inline-block size-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 shrink-0" />
                                <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ attr.name }}</span>
                            </div>
                            <div>
                                <USwitch
                                    :model-value="currentPkg.state[group.module.module].subs[subGroup.sub.name].attrs[attr.name].enabled"
                                    :disabled="isAttrDimmed(group.module.module, subGroup.sub.name)"
                                    color="success"
                                    @update:model-value="toggleAttr(group.module.module, subGroup.sub.name, attr.name)"
                                />
                            </div>
                            <div class="flex items-center gap-2">
                                <UInput
                                    v-if="attr.limit"
                                    :model-value="displayLimit(currentPkg.state[group.module.module].subs[subGroup.sub.name].attrs[attr.name].limit)"
                                    type="number"
                                    size="xs"
                                    class="w-20"
                                    placeholder="∞"
                                    :disabled="isAttrDimmed(group.module.module, subGroup.sub.name) || !currentPkg.state[group.module.module].subs[subGroup.sub.name].attrs[attr.name].enabled"
                                    @update:model-value="(v: string | number) => {
                                        const num = v === '' || v === '∞' ? 0 : Math.max(0, parseInt(String(v)) || 0)
                                        currentPkg.state[group.module.module].subs[subGroup.sub.name].attrs[attr.name].limit = num
                                    }"
                                />
                            </div>
                        </div>
                    </template>
                </template>
            </template>
        </UCard>

        <!-- Manage Package Modal -->
        <UModal
            v-model:open="manageModalOpen"
            title="Manage Package"
            :ui="{ footer: 'justify-end' }"
        >
            <template #body>
                <div class="space-y-4">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-neutral-200">
                                    <th class="text-left py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Nama Package
                                    </th>
                                    <th class="text-left py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th class="text-left py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Fitur aktif
                                    </th>
                                    <th class="py-3 px-3" />
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="pkg in packages"
                                    :key="pkg.id"
                                    class="border-b border-neutral-100"
                                >
                                    <td class="py-3 px-3">
                                        <UInput
                                            :model-value="pkg.name"
                                            size="sm"
                                            class="w-36"
                                            @update:model-value="(v: string) => renamePkg(pkg.id, v)"
                                        />
                                    </td>
                                    <td class="py-3 px-3">
                                        <UBadge
                                            :color="pkg.status === 'active' ? 'success' : 'warning'"
                                            variant="subtle"
                                            class="cursor-pointer"
                                            @click="togglePkgStatus(pkg.id)"
                                        >
                                            {{ pkg.status === 'active' ? 'Aktif' : 'Nonaktif' }}
                                        </UBadge>
                                    </td>
                                    <td class="py-3 px-3 tabular-nums text-neutral-600">
                                        {{ countEnabled(pkg) }} / {{ totalAttrs() }}
                                    </td>
                                    <td class="py-3 px-3">
                                        <div class="flex items-center gap-1">
                                            <UButton
                                                variant="ghost"
                                                color="neutral"
                                                size="xs"
                                                icon="lucide:settings-2"
                                                @click="() => { currentPkgId = pkg.id; manageModalOpen = false }"
                                            />
                                            <UButton
                                                variant="ghost"
                                                color="error"
                                                size="xs"
                                                icon="lucide:trash-2"
                                                @click="requestDeletePkg(pkg.id)"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Add package -->
                    <div class="flex gap-2">
                        <UInput
                            v-model="newPkgName"
                            placeholder="Nama package baru, contoh: Ultimate"
                            class="flex-1"
                            @keyup.enter="addPackage"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:plus"
                            @click="addPackage"
                        >
                            Tambah
                        </UButton>
                    </div>
                    <p class="text-xs text-neutral-400">
                        Package baru otomatis dibuat dengan pengaturan default sama seperti Basic. Nonaktifkan package untuk menyembunyikannya tanpa menghapus datanya.
                    </p>
                </div>
            </template>

            <template #footer>
                <UButton
                    color="neutral"
                    variant="outline"
                    @click="manageModalOpen = false"
                >
                    Tutup
                </UButton>
            </template>
        </UModal>

        <!-- Delete Confirm Modal -->
        <ModalConfirmNegativeAction
            v-model:open="deleteConfirmOpen"
            title="Hapus Package"
            body="Hapus package ini? Pengaturan fiturnya akan hilang."
            confirm-label="Ya, Hapus"
            @confirm="confirmDeletePkg"
            @cancel="deleteConfirmOpen = false"
        />
    </div>
</template>
