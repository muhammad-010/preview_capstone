import type { NavigationMenuItem } from '@nuxt/ui'

export function useNavigationState() {
    const navigation = useState<NavigationMenuItem[]>(STATE_NAVIGATION, () => [])

    return { navigation }
}

export function setNavigationState(nav: NavigationMenuItem[]) {
    const { navigation } = useNavigationState()
    navigation.value = nav
}

export function getNavigationState(): NavigationMenuItem[] {
    const { navigation } = useNavigationState()
    return navigation.value
}
