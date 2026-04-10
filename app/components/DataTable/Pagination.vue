<script setup lang="ts">
const props = defineProps<{
    total: number
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
const start = computed(() => props.total === 0 ? 0 : (page.value - 1) * limit.value + 1)
const end = computed(() => Math.min(page.value * limit.value, props.total))
</script>

<template>
    <div class="flex justify-between border-t border-default pt-4 px-4">
        <div class="text-toned">
            Showing {{ `${start} - ${end}` }} of {{ total }} data
        </div>

        <div class="flex items-center">
            <USelect
                v-model="limit"
                :items="PAGINATION_LIMIT"
            />
            <UPagination
                :page="page"
                :items-per-page="limit"
                :total="total"
                :sibling-count="1"
                class="ml-4"
                @update:page="(p) => page = p"
            />
        </div>
    </div>
</template>
