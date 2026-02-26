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
        if (matchRoute(route.to, path)) {
            layoutProp.pageTitle = route.title
            layoutProp.pageSubtitle = route.description || ''

            const item: BreadcrumbItem = {
                label: route.label,
                to: route.to,
            }
            for (const [key, value] of Object.entries(params)) {
                if (route.to.endsWith(key)) {
                    layoutProp.pageTitle = value.label || ''
                    item.label = value.label || ''
                    item.to = route.to.replace(key, value.param || '')
                }
            }
            layoutProp.pageBreadCrumb = [...acc, item]
            return layoutProp
        }

        if (route.child) {
            const item: BreadcrumbItem = {
                label: route.label,
                to: route.to,
            }
            for (const [key, value] of Object.entries(params)) {
                if (route.to.endsWith(key)) {
                    item.label = value.label || ''
                    item.to = route.to.replace(key, value.param || '')
                }
            }
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
