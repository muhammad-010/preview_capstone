<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()

async function useDashboardListEvent(tId: number) {
    const { data } = await useFetch(`/api/tenant/${tId}/event`, {
        query: { page: 1, limit: 5 },
        transform: res => res.data,
    })
    const events = computed<TenantEvent[]>(() => data.value?.events ?? [])
    const total = 5

    return { events, total }
}

const { events, total } = await useDashboardListEvent(tenantId.value)

useHead({
    title: 'Event Dashboard',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <div class="grid grid-cols-4 gap-4 mb-8">
            <CardTotal
                title="Total Events"
                :total="80"
                icon="lucide:calendar"
            />

            <CardTotal
                title="Active Events"
                :total="84"
                icon="lucide:clock"
            />

            <CardTotal
                title="Total Check-ins"
                :total="12500"
                icon="lucide:circle-check"
            />

            <CardTotal
                title="Avg. Attendees"
                :total="86"
                percentage
                icon="lucide:users"
            />
        </div>

        <div class="grid grid-cols-3 gap-4">
            <UCard class="col-span-2">
                <template #header>
                    <div class="flex justify-between items-center">
                        <h3>Recent Events</h3>
                        <UButton
                            color="primary"
                            class="cursor-pointer"
                            to="/events"
                        >
                            View All
                        </UButton>
                    </div>
                </template>

                <TableEvent
                    :data="events"
                    :total="total"
                />
            </UCard>

            <UCard class="col-span-1">
                <template #header>
                    <div class="flex justify-between items-center">
                        <h3>Live Activity</h3>
                    </div>
                </template>
            </UCard>
        </div>
    </div>
</template>
