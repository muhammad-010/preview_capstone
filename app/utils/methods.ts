import type { BreadcrumbItem } from '@nuxt/ui'

const UNITS = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
]

export function useNumberSuffix(value: number, decimals = 1): string {
    if (value < 1000) return value.toString()

    for (const unit of UNITS) {
        if (value >= unit.value) {
            const num = value / unit.value
            return `${num.toFixed(num % 1 === 0 ? 0 : decimals)}${unit.suffix}`
        }
    }

    return value.toString()
}

export function matchRoute(pattern: string, path: string) {
    const p = pattern.split('/')
    const c = path.split('/')

    if (p.length !== c.length) return false

    return p.every((seg, i) => seg.startsWith(':') || seg === c[i])
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
            if (next) return next
        }
    }

    return layoutProp
}
