const DEFAULT_ACTIVE_TENANT_INDEX = 0

export function useUserState(): UserStateComposable {
    const { user } = useUserSession()
    if (!user.value || !user.value.assigned_tenant) {
        throw createError('Invalid assigned tenant when assigning state')
    }
    const activeTenantIndex = useState<number>(STATE_USER_ACTIVE_TENANT_INDEX, () => DEFAULT_ACTIVE_TENANT_INDEX)
    const tenantList = computed(() => user.value?.assigned_tenant || [])

    if (!tenantList.value[activeTenantIndex.value]) {
        throw createError('Invalid active tenant when assigning state')
    }
    else if (!tenantList.value[activeTenantIndex.value]!.role_slug) {
        throw createError('Invalid active role_slug when assigning state')
    }
    else if (!tenantList.value[activeTenantIndex.value]!.id && !isSuperAdmin(tenantList.value[activeTenantIndex.value]!.role_slug)) {
        throw createError('Invalid active tenant id when assigning state')
    }
    const roleSlug = computed(() => tenantList.value[activeTenantIndex.value]?.role_slug || null)
    const redirect = computed(() => defaultRedirect(tenantList.value[activeTenantIndex.value]?.role_slug || null))
    const navigation = computed(() => shallowNavigationPerRole(tenantList.value[activeTenantIndex.value]?.role_slug || null))
    const tenantId = computed(() => tenantList.value[activeTenantIndex.value]!.id)

    return {
        activeTenantIndex,
        tenantList,
        roleSlug,
        redirect,
        navigation,
        tenantId,
    }
}

export function setUserActiveTenantIndexState(index: number) {
    const {
        tenantList,
        activeTenantIndex,
        roleSlug,
        redirect,
    } = useUserState()
    if (index < 0 || index + 1 > tenantList.value.length) {
        throw createError('Invalid tenant index when updating state')
    }
    const oldRoleSlug = roleSlug.value
    activeTenantIndex.value = index

    if (roleSlug.value !== oldRoleSlug) {
        navigateTo(redirect.value)
    }
}

export function getUserActiveTenantIndexState(): number {
    const { activeTenantIndex } = useUserState()
    return activeTenantIndex.value
}
