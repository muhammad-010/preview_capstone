import type { NavigationMenuItem } from '@nuxt/ui'

// EMITS
export const EMIT_FORM_CANCEL = 'cancel'
export const EMIT_FORM_SAVE = 'save'

// STATE
export const STATE_LAYOUT_PAGE_TITLE = 'layout:pageTitle'
export const STATE_LAYOUT_PAGE_SUBTITLE = 'layout:pageSubtitle'
export const STATE_LAYOUT_PAGE_BREADCRUMB = 'layout:pageBreadCrumb'
export const STATE_NAVIGATION = 'navigation'

// STATUS
export const STATUS_ACTIVE: Status = 'active'
export const STATUS_INACTIVE: Status = 'inactive'

export const STATUS_DROPDOWN: Status[] = [
    STATUS_ACTIVE,
    STATUS_INACTIVE,
]

export const STATUS_COLORS: Record<Status, 'success' | 'error'> = {
    [STATUS_ACTIVE]: 'success',
    [STATUS_INACTIVE]: 'error',
} as const

// NAVIGATIONS
export const SUPER_ADMIN_NAVIGATIONS: NavigationMenuItem[] = [
    ...APP_ROUTES
        .filter((route: AppRoute) => SUPER_ADMIN_APP_ROUTES.includes(route.to))
        .map((route: AppRoute): NavigationMenuItem => ({
            label: route.label,
            icon: route.icon,
            to: route.to,
        })),
]
