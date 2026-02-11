import type { BreadcrumbItem } from '@nuxt/ui'

export function useLayoutPropState() {
    const pageTitle = useState<string>(STATE_LAYOUT_PAGE_TITLE, () => '')
    const pageSubtitle = useState<string>(STATE_LAYOUT_PAGE_SUBTITLE, () => '')
    const pageBreadCrumb = useState<BreadcrumbItem[]>(STATE_LAYOUT_PAGE_BREADCRUMB, () => [])

    return {
        pageTitle,
        pageSubtitle,
        pageBreadCrumb,
    }
}

export function setLayoutPropState(props: LayoutProp) {
    const { pageTitle, pageSubtitle, pageBreadCrumb } = useLayoutPropState()
    pageTitle.value = props.pageTitle
    pageSubtitle.value = props.pageSubtitle
    pageBreadCrumb.value = props.pageBreadCrumb
}
