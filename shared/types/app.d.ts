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

export type CheckInMethod = 'check-in-scan' | 'check-in-manual'

export interface ParticipantCheckInTarget {
    id: number
    sessionId: number
    sessionName: string
    name: string
    maxAttendance: number
    customAttributes: CustomAttribute[]
}

export type EditorMode = 'invitation-email' | 'check-in-page'

export type Orientation = 'portrait' | 'landscape'

export interface Coordinate {
    x: number
    y: number
}

export type CoordinateKey = keyof Coordinate

export interface BackgroundImage {
    file: File | null
    dataUrl: string
}

export interface CanvasSize {
    id: string
    width: number
    height: number
    label: string
    breakpoint: string
    orientation: Orientation
}

export interface BlockSetting {
    key: string
    value: string | boolean | number
    label?: string
    type?: string
    options?: string[]
}

export interface Block {
    id: string
    setting: BlockSetting[]
    style: BlockSetting[]
    x: number
    y: number
    compiledStyle: string
}

export interface ElementBlock extends Block {
    uid: string
    label: string
    html: (setting: BlockSetting[], compiledStyle: string) => string
    editableData: boolean
}

export interface SavedVariant {
    variantId?: number
    slug: string
    bgImage: string
    customBlock: Block[]
    staticBlock: Block[]
}

export interface SavedTemplate {
    templateId?: number
    type?: string
    settings: SavedVariant[]
}
