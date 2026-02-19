<script
  setup
  lang="ts"
  generic="
    O extends Record<string, any>,
    K extends keyof O | undefined = undefined
  "
>
import { computed } from 'vue'

type ModelType
    = K extends keyof O
        ? O[K]
        : O

const model = defineModel<ModelType[]>({
    default: () => [],
})

const props = defineProps<{
    sourceTitle?: string
    destinationTitle?: string
    options: O[]
    keyProp?: K
}>()

const getValue = props.keyProp
    ? (option: O) => option[props.keyProp!] as ModelType
    : (option: O) => option as ModelType

const selectedSet = computed(() => new Set(model.value))

const partitioned = computed(() => {
    const selected: O[] = []
    const unselected: O[] = []

    const set = selectedSet.value

    for (const option of props.options) {
        if (set.has(getValue(option))) {
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

const toggle = (option: O) => {
    const value = getValue(option)
    const set = new Set(model.value)

    if (set.has(value)) {
        set.delete(value)
    }
    else {
        set.add(value)
    }

    model.value = Array.from(set)
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
                    v-for="(option, i) in unselectedOptions"
                    :key="props.keyProp ? option[props.keyProp] : i"
                >
                    <slot
                        :option="option"
                        :selected="true"
                        :toggle="() => toggle(option)"
                        :is-selected="true"
                    >
                        <UButton
                            @click="toggle(option)"
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
                    v-for="(option, i) in selectedOptions"
                    :key="props.keyProp ? option[props.keyProp] : i"
                >
                    <slot
                        :option="option"
                        :selected="false"
                        :toggle="() => toggle(option)"
                        :is-selected="false"
                    >
                        <UButton
                            @click="toggle(option)"
                        >
                            {{ option }}
                        </UButton>
                    </slot>
                </template>
            </div>
        </UCard>
    </div>
</template>
