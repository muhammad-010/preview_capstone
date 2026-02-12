import type { BreadcrumbItem } from '@nuxt/ui'

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

export interface TablePagination {
    /** page */
    pageIndex: number
    /** items per page */
    pageSize: number
}
