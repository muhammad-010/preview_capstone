export default defineNuxtRouteMiddleware((to, _) => {
    const eventId = useState(STATE_CHECK_IN_EVENT_ID, () => to.params.event_id)
    eventId.value = to.params.event_id
})
