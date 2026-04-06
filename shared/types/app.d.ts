import type { BreadcrumbItem, NavigationMenuItem } from '@nuxt/ui'

export interface AppRoute {
    title: string
    description?: string
    label: string
    to: string
    icon?: string
    isDefault?: boolean
    render?: boolean
    disabled?: boolean
    child?: AppRoute[]
}

export interface UserStateComposable {
    id: ComputedRef<number>
    activeTenantIndex: Ref<number>
    tenantList: ComputedRef<AuthSessionAssignedTenant[]>
    roleSlug: ComputedRef<RoleSlug | null>
    redirect: ComputedRef<string>
    navigation: ComputedRef<NavigationMenuItem[]>
    tenantId: ComputedRef<number>
    tenantName: ComputedRef<string>
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

export interface BlockStyle {
    key: string
    label: string
    type: string
    value: string | boolean | number
    options?: string[]
}

export interface Block {
    id: string
    label: string
    data: string
    style: BlockStyle[]
    compiledStyle: string
    html: (data: string, compiledStyle: string) => string
    editableData?: boolean

    uid: stirng
    x: number
    y: number
}
