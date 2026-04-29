import type { BreadcrumbItem, NavigationMenuItem } from '@nuxt/ui'

export interface SuccessToastOpt {
    title?: string
    description?: string
    skipToast?: boolean
}

export interface ErrorToastOpt extends SuccessToastOpt {
    error?: unknown
}

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
    file?: File
    dataUrl: string
    width: number
    height: number
    name?: string
}

export interface ElementBackgroundImage extends BackgroundImage {
    perBreakpoint?: Partial<Record<
        Breakpoint,
        BackgroundImage
    >>
}

export interface CanvasSize {
    id: Breakpoint
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
    trueValue?: string
    falseValue?: string
    min?: number
    max?: number
}

export interface Block {
    elementId?: number
    uid: string
    id: string
    value: string
    setting: BlockSetting[]
    style: BlockSetting[]
    x: number
    y: number
    withValue?: boolean
}

export interface ElementBlock extends Block {
    label: string
    editableData: boolean
    perBreakpoint?: Partial<Record<
        Breakpoint,
        Block
    >>
}

export interface SavedVariant {
    variantId?: number
    slug: string
    bgImage: string
    customBlock: ElementBlock[]
    staticBlock: ElementBlock[]
}

export interface SavedTemplate {
    templateId?: number
    type?: string
    settings: SavedVariant[]
}

export type BackgroundPerBreakpoint = Record<Breakpoint, string | undefined>
