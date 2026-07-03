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

export type Orientation = 'portrait' | 'landscape'

export interface Coordinate {
    x: number
    y: number
}

export type CoordinateKey = keyof Coordinate

export interface BackgroundImage {
    file?: File
    dataUrl: string
    uploadKey: string
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
    variantId?: number
    id: Breakpoint
    width: number
    height: number
    label: string
    breakpoint: string
    orientation: Orientation
}

/**
 * EditorV2 canvas-size preset for the image-based editors (invitation /
 * certificate). Decoupled from the breakpoint slug: only its width/height feed
 * the canvas dimensions and the saved variant `setting`.
 */
export interface CanvasSizePreset {
    key: string
    label: string
    width: number
    height: number
    orientation: Orientation
}

export interface BlockSetting {
    key: string
    value: string | boolean | number
    label?: string
    type?: string
    options?: Record<'value' | 'label' | 'description', string>[]
    trueValue?: string
    falseValue?: string
    /** whether hide this setting */
    hidden?: boolean
    min?: number
    max?: number
}

export interface Block {
    elementId?: number
    uid?: number
    id: string
    type: string
    value: string
    setting: BlockSetting[]
    style: BlockSetting[]
    x: number
    y: number
    /** whether display the value setting for this block */
    withValue?: boolean
    isDynamic?: boolean
    /**
     * EDITOR-ONLY rotation in degrees, used by EditorV2's rotate handle.
     * Transient: it is not serialized by makeTemplateVariant() nor restored by
     * parseTemplateVariants(), so it never reaches the backend. Persist it only
     * once the backend renderer supports a rotation field (see the EditorV2 plan).
     */
    rotate?: number
}

export interface ElementBlock extends Block {
    label: string
    perBreakpoint?: Partial<Record<
        Breakpoint,
        Block
    >>
}

export type BackgroundPerBreakpoint = Record<Breakpoint, string | undefined>

export interface EditorV2Props {
    tenantId: number
    eventId: number
    templateId?: number

    customBlocks: ElementBlock[]
    staticBlocks: ElementBlock[]
    canvasSizeOptions: CanvasSize[]
    fontOptions: TemplateFont[]

    defaultSelectedCanvasSizeIds: Breakpoint[]
    defaultActiveCanvasSizeId: Breakpoint
    defaultOrientation: Orientation
    defaultSelectedBlocks: ElementBlock[]
    defaultActiveStaticBlocks: string[]
    defaultBackgroundImages: Partial<Record<Breakpoint, BackgroundImage>>

    withPreview?: boolean
    htmlPreviewFn?: (
        bgImage: BackgroundImage,
        width: number,
        height: number,
        content: string,
        staticContent: string,
        fontFaces: string,
    ) => string
    previewPath?: string
    previewKey?: string

    canvasImageBased?: boolean

    pageTitle?: string
    defaultScale?: number

    // Path (no origin) of the backend factory default background for this editor,
    // e.g. '/storage/file/static/image/default_certificate.png'. The Reset button
    // restores this image; the origin is derived from the loaded background URL.
    defaultBackgroundPath?: string
}
