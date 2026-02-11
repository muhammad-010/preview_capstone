<script setup lang="ts">
const { pageTitle, pageSubtitle, pageBreadCrumb } = useLayoutPropState()
const company = ref({
    name: 'EnterpriseEvent',
    logo: '/logo.png',
})
const user = ref({
    name: 'John Doe',
    role: 'Administrator',
})
setNavigationState(SUPER_ADMIN_NAVIGATIONS)
const navigation = getNavigationState()
const isCollapsed = ref(false)
const refNavbar = ref<HTMLElement | null>(null)
</script>

<template>
    <UDashboardGroup>
        <UDashboardSidebar
            v-model:collapsed="isCollapsed"
            collapsible
            :default-size="15"
            :collapsed-size="4"
            toggle-side="right"
        >
            <template #header="{ collapsed }">
                <MiscCompanyLogo
                    :name="company.name"
                    :logo="company.logo"
                    :collapsed="collapsed"
                />
            </template>

            <template #default="{ collapsed }">
                <UNavigationMenu
                    :collapsed="collapsed"
                    :items="navigation"
                    orientation="vertical"
                />
            </template>

            <template #footer="{ collapsed }">
                <div
                    class="flex items-center text-left gap-2 w-full min-h-12"
                    :class="{ 'justify-center': collapsed }"
                >
                    <Transition name="fade">
                        <UAvatar
                            v-if="!collapsed"
                            :name="user.name"
                            size="lg"
                        />
                    </Transition>
                    <Transition name="fade">
                        <div v-if="!collapsed">
                            <p class="text-secondary-50 font-semibold">
                                {{ user.name }}
                            </p>
                            <small class="text-sm text-secondary-400">
                                {{ user.role }}
                            </small>
                        </div>
                    </Transition>
                    <UButton
                        icon="lucide:log-out"
                        variant="ghost"
                        size="lg"
                        class="text-secondary-300! hover:bg-primary/50 dark:hover:bg-primary/25 cursor-pointer"
                        :class="{ 'ml-auto': !collapsed }"
                        @click="navigateTo('/auth/login')"
                    />
                </div>
            </template>
        </UDashboardSidebar>

        <div class="w-full">
            <UDashboardNavbar
                ref="refNavbar"
                toggle-side="right"
                class="sticky top-0 z-50 py-3 px-2! lg:px-4! lg:py-4!"
            >
                <template #leading>
                    <UDashboardSidebarCollapse class="cursor-pointer" />
                    <UBreadcrumb
                        :items="pageBreadCrumb"
                        class="ml-4 lg:ml-2 transition-all"
                    />
                </template>

                <template #right>
                    <UColorModeButton class="navbar-ghost-button" />
                </template>
            </UDashboardNavbar>

            <UContainer
                class="py-4 lg:pt-0! h-[94vh] overflow-y-auto scrollbar"
                :class="`h-[calc(100dvh - ${refNavbar?.clientHeight || 0}px)] ${!isCollapsed ? 'lg:px-12': ''}`"
            >
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 v-if="pageTitle">
                            {{ pageTitle }}
                        </h2>
                        <small v-if="pageSubtitle">{{ pageSubtitle }}</small>
                    </div>
                </div>

                <slot />
            </UContainer>
        </div>
    </UDashboardGroup>
</template>
