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
    portrait: File | null
    landscape: File | null
    portraitDataURL: string
    landscapeDataURL: string
}

export interface BlockStyle {
    key: string
    value: string | boolean | number
    label?: string
    type?: string
    options?: string[]
}

export interface BlockData {
    key: string
    value: string
    label?: string
}

export interface Block {
    uid: string
    id: string
    label: string
    data: BlockData[]
    style: BlockStyle[]
    portraitPos: Coordinate
    landscapePos: Coordinate
    compiledStyle: string
    html: (data: BlockData[], compiledStyle: string) => string
    editableData: boolean
}

export interface CanvasSize {
    width: number
    height: number
    label: string
    orientation: Orientation
}

export interface SavedBlockSettings {
    id: string
    style: BlockStyle[]
    data: BlockData[]
    portraitPos: Coordinate
    landscapePos: Coordinate
    compiledStyle: string
}

export interface SavedSetttings {
    bgPortraitDataURL: string
    bgLandscapeDataURL: string
    customBlock: SavedBlockSettings[]
    staticBlock: SavedBlockSettings[]
}
