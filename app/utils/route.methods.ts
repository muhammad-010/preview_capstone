import type { BreadcrumbItem, NavigationMenuItem } from '@nuxt/ui'

export function shallowNavigationPerRole(role: RoleSlug | null): NavigationMenuItem[] {
    return role
        ? [
                ...routePerRole(role)
                    .filter((route: AppRoute) => route.render)
                    .map((route: AppRoute): NavigationMenuItem => ({
                        label: route.label,
                        icon: route.icon,
                        to: route.to,
                    })),
            ]
        : []
}

export function buildLayoutProp(
    routes: AppRoute[],
    path: string,
    params: Record<string, BreadCrumbParam>,
    acc: BreadcrumbItem[] = [],
): LayoutProp {
    const layoutProp = {
        pageTitle: '',
        pageSubtitle: '',
        pageBreadCrumb: [] as BreadcrumbItem[],
    }

    for (const route of routes) {
        const splittedRoute = route.to.split('/').filter(seg => seg.startsWith(':'))
        const match = matchRoute(route.to, path)
        const item: BreadcrumbItem = {
            label: route.label,
        }
        let to = route.to
        for (const [key, value] of Object.entries(params)) {
            if (splittedRoute.includes(key)) {
                layoutProp.pageTitle = match ? value.label || '' : layoutProp.pageTitle
                item.label = route.to.endsWith(key) ? value.label || '' : item.label
                to = to.replace(key, value.param || '')
                if (route.disabled) {
                    item.slot = 'disabled' as const
                }
            }
        }
        item.to = to

        if (match) {
            layoutProp.pageTitle = layoutProp.pageTitle ? layoutProp.pageTitle : route.title
            layoutProp.pageSubtitle = route.description || ''
            layoutProp.pageBreadCrumb = [...acc, item]
            return layoutProp
        }

        if (route.child) {
            const next = buildLayoutProp(
                route.child,
                path,
                params,
                [
                    ...acc,
                    item,
                ],
            )
            if (next.pageTitle && next.pageSubtitle && next.pageBreadCrumb.length > 0) return next
        }
    }

    return layoutProp
}
