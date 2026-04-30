export default defineNuxtRouteMiddleware(() => {
    const activeTab = useState(STATE_EVENT_DETAIL_ACTIVE_TAB, () => '0')
    activeTab.value = '0'
})
