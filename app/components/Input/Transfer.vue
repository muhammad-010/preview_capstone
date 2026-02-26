<script
  setup
  lang="ts"
  generic="O extends Record<string, any>, K extends keyof O"
>
import { computed } from 'vue'

const props = defineProps<{
    sourceTitle?: string
    destinationTitle?: string
    options: O[]
    keyProp: K
}>()
const model = defineModel<O[K][]>({ default: () => [] })
const partitioned = computed(() => {
    const selected: O[] = []
    const unselected: O[] = []
    const data = model.value
    for (const option of props.options) {
        if (data.includes(option[props.keyProp])) {
            selected.push(option)
        }
        else {
            unselected.push(option)
        }
    }
    return { selected, unselected }
})
const selectedOptions = computed(() => partitioned.value.selected)
const unselectedOptions = computed(() => partitioned.value.unselected)

function toggle(value: O[K]) {
    const data = model.value
    const i = data.indexOf(value)
    if (i !== -1) {
        data.splice(i, 1)
    }
    else {
        data.push(value)
    }
    model.value = data
}

const cardUI = {
    header: 'bg-primary-50 dark:bg-primary-950',
    body: 'h-[30vh] overflow-y-auto scrollbar',
}
</script>

<template>
    <div class="flex gap-6">
        <UCard
            class="w-full"
            :ui="cardUI"
        >
            <template #header>
                <h5>{{ props.sourceTitle }}</h5>
            </template>

            <div class="flex flex-col gap-4">
                <template
                    v-for="(option) in unselectedOptions"
                    :key="option[props.keyProp]"
                >
                    <slot
                        :option="option"
                        :selected="true"
                        :toggle="() => toggle(option[props.keyProp])"
                        :is-selected="true"
                    >
                        <UButton
                            @click="toggle(option[props.keyProp])"
                        >
                            {{ option }}
                        </UButton>
                    </slot>
                </template>
            </div>
        </UCard>

        <UCard
            class="w-full"
            :ui="cardUI"
        >
            <template #header>
                <h5>{{ props.destinationTitle }}</h5>
            </template>

            <div class="flex flex-col gap-4">
                <template
                    v-for="(option) in selectedOptions"
                    :key="option[props.keyProp]"
                >
                    <slot
                        :option="option"
                        :selected="false"
                        :toggle="() => toggle(option[props.keyProp])"
                        :is-selected="false"
                    >
                        <UButton
                            @click="toggle(option[props.keyProp])"
                        >
                            {{ option }}
                        </UButton>
                    </slot>
                </template>
            </div>
        </UCard>
    </div>
</template>
