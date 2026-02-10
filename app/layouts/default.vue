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
                toggle-side="right"
                class="sticky top-0 z-50 py-3 px-2! lg:px-4! lg:py-4!"
            >
                <template #leading>
                    <UDashboardSidebarCollapse class="cursor-pointer" />
                    <!-- <MiscCompanyLogo
                        :name="company.name"
                        :logo="company.logo"
                        :collapsed="false"
                        class="ml-4 lg:hidden"
                    /> -->
                    <UBreadcrumb
                        :items="pageBreadCrumb"
                        class="ml-4 lg:ml-2 transition-all"
                    />
                </template>

                <template #right>
                    <UColorModeButton class="max-lg:text-secondary-300! max-lg:hover:bg-primary/50 max-lg:dark:hover:bg-primary/25 cursor-pointer" />
                </template>
            </UDashboardNavbar>

            <UContainer
                class="flex-1 py-4 lg:pt-0! h-full overflow-auto!"
                :class="{ 'lg:px-12': !isCollapsed }"
            >
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <!-- <UBreadcrumb
                        :items="layoutProps.pageBreadCrumb"
                        class="mb-2"
                    /> -->
                        <Transition name="fade">
                            <h1
                                v-if="pageTitle"
                                class="text-2xl font-semibold"
                            >
                                {{ pageTitle }}
                            </h1>
                        </Transition>
                        <Transition name="fade">
                            <small v-if="pageSubtitle">{{ pageSubtitle }}</small>
                        </Transition>
                    </div>
                </div>

                <UContainer class="mx-0! px-0!">
                    <slot />
                </UContainer>
            </UContainer>
        </div>
    </UDashboardGroup>
</template>
