<script setup lang="ts">
const route = useRoute()

const settingsMenus = [
    {
        title: 'Batas Seat',
        description: 'Konfigurasi batas seat tenant.admin dan member per tier plan',
        icon: 'lucide:users',
        to: '/settings/seat-limit',
    },
    {
        title: 'Kebijakan Keamanan',
        description: 'Aturan password dan sesi login platform',
        icon: 'lucide:shield-check',
        to: '/settings/security',
    },
    {
        title: 'Template Email',
        description: 'Kelola template email dan notifikasi default',
        icon: 'lucide:mail',
        to: '/settings/email-templates',
    },
    {
        title: 'Audit Trail',
        description: 'Riwayat perubahan tenant dan log aktivitas',
        icon: 'lucide:scroll-text',
        to: '/settings/audit-trail',
    },
    {
        title: 'Staf Platform',
        description: 'Undang dan kelola staf platform superadmin',
        icon: 'lucide:user-plus',
        to: '/settings/platform-staff',
    },
    {
        title: 'Konfigurasi Package',
        description: 'Atur fitur dan limit per package (Basic, Pro, Enterprise)',
        icon: 'lucide:package',
        to: '/settings/package',
    },
]

useHead({
    title: 'Settings',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard
                v-for="menu in settingsMenus"
                :key="menu.to"
                class="hover:shadow-md transition-shadow cursor-pointer group"
                @click="navigateTo(menu.to)"
            >
                <div class="flex items-start gap-4">
                    <div class="rounded-lg bg-primary-50 p-3 group-hover:bg-primary-100 transition-colors">
                        <UIcon
                            :name="menu.icon"
                            class="size-6 text-primary"
                        />
                    </div>
                    <div class="flex-1">
                        <h5 class="group-hover:text-primary transition-colors">
                            {{ menu.title }}
                        </h5>
                        <small class="text-neutral-500">{{ menu.description }}</small>
                    </div>
                    <UIcon
                        name="lucide:chevron-right"
                        class="size-5 text-neutral-300 group-hover:text-primary transition-colors mt-1"
                    />
                </div>
            </UCard>
        </div>
    </div>
</template>
