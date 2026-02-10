import type { BreadcrumbItem } from '@nuxt/ui'

export interface Reference {
    id: number
    label: string
}

export type Status = 'active' | 'inactive'

export interface AppRoute {
    title: string
    description?: string
    label: string
    to: string
    icon?: string
    isDefault?: boolean
    render?: boolean
    child?: AppRoute[]
}

export interface BreadCrumbParam {
    param: string
    label: string
}

export interface LayoutProp {
    pageTitle: string
    pageSubtitle: string
    pageBreadCrumb: BreadcrumbItem[]
}
