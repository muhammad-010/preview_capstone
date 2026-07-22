import type { AppRoute } from '../types/app'

export const APP_UNAUTHORIZED_REDIRECT = '/auth/login'

export const APP_PUBLIC_ROUTE: string[] = [
    '/auth',
    '/guest',
    '/storage',
]

export const APP_SUPER_ADMIN_ROUTES: string[] = [
    '/dashboard',
    '/tenants',
    '/settings',
]

export const APP_TENANT_ADMIN_ROUTES: string[] = [
    '/dashboard-event',
    '/events',
    '/members',
    '/reports',
    '/lottery',
]

export const APP_POC_ADMIN_ROUTES: string[] = [
    '/my-events',
    '/check-in',
]

export const APP_ROUTES: AppRoute[] = [
    {
        title: 'Super Admin Dashboard',
        description: 'Overview of all system tenants and global metrics',
        label: 'Dashboard',
        icon: 'lucide:layout-dashboard',
        to: '/dashboard',
        isDefault: true,
        render: true,
    },
    {
        title: 'Event Dashboard',
        description: 'Manage your events and monitor real-time check-ins',
        label: 'Dashboard',
        icon: 'lucide:layout-dashboard',
        to: '/dashboard-event',
        render: true,
    },
    {
        title: 'My Assigned Events',
        description: 'Events you\'re assigned into to manage check-ins',
        label: 'My Events',
        icon: 'lucide:calendar',
        to: '/my-events',
        isDefault: true,
        render: true,
        child: [
            {
                title: 'My Event Detail',
                description: 'Detailed information about event and attendance',
                label: 'Detail',
                to: '/my-events/:event_id',
            },
        ],
    },

    {
        title: 'Tenants',
        description: 'Manage all organizations and subscriptions',
        label: 'Tenants',
        icon: 'lucide:building',
        to: '/tenants',
        render: true,
        child: [
            {
                title: 'Add New Tenant',
                description: 'Onboard a new organization to the platform',
                label: 'Add',
                to: '/tenants/add',
            },
            {
                title: 'Tenant Detail',
                description: 'Detailed information about organization and subscription',
                label: 'Detail',
                to: '/tenants/:tenant_id',
                child: [
                    {
                        title: 'Edit Tenant',
                        description: 'Update organization and subscription information',
                        label: 'Edit',
                        to: '/tenants/:tenant_id/edit',
                    },
                ],
            },
        ],
    },
    {
        title: 'Events',
        description: 'Manage and monitor all your events',
        label: 'Events',
        icon: 'lucide:calendar',
        to: '/events',
        isDefault: true,
        render: true,
        child: [
            {
                title: 'Add New Event',
                description: 'Configure event detail, seating, and personnel',
                label: 'Add',
                to: '/events/add',
            },
            {
                title: 'Event Detail',
                description: 'Detailed information about event and attendance',
                label: 'Detail',
                to: '/events/:event_id',
                child: [
                    {
                        title: 'Edit Event',
                        description: 'Update event and personnel information',
                        label: 'Edit',
                        to: '/events/:event_id/edit',
                    },
                    {
                        title: 'Edit Invitation Email',
                        description: 'Change invitation email looks and feel',
                        label: 'Edit',
                        to: '/events/:event_id/invitation-email',
                    },
                    {
                        title: 'Add New Participant',
                        description: 'Assign new participant into the event',
                        label: 'Add',
                        to: '/events/:event_id/participant/add',
                    },
                    {
                        title: 'Participant Detail',
                        description: 'Detailed information about participant',
                        label: 'Detail',
                        to: '/events/:event_id/participant/:participant_id',
                        disabled: true,
                        child: [
                            {
                                title: 'Edit Participant',
                                description: 'Update participant information',
                                label: 'Edit',
                                to: '/events/:event_id/participant/:participant_id/edit',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        title: 'Members',
        description: 'Manage POC members who can be assigned to events',
        label: 'Members',
        icon: 'lucide:user-cog',
        to: '/members',
        render: true,
        child: [
            {
                title: 'Add New Member',
                description: 'Configure new member as a POC',
                label: 'Add',
                to: '/members/add',
            },
            {
                title: 'Member Detail',
                description: 'Detailed information about member',
                label: 'Detail',
                to: '/members/:user_id',
                disabled: true,
                child: [
                    {
                        title: 'Edit Member',
                        description: 'Update member information',
                        label: 'Edit',
                        to: '/members/:user_id/edit',
                    },
                ],
            },
        ],
    },
    {
        title: 'Lottery Page',
        label: 'Lottery Page',
        icon: 'lucide:gift',
        to: '/lottery',
        render: false,
        disabled: true,
        child: [
            {
                title: 'Roll Prize',
                description: 'Roll prize from prize pool',
                label: 'Roll Prize',
                to: '/lottery/:event_id',
                render: false,
                disabled: true,
            },
        ],
    },
    {
        title: 'Check In',
        label: 'Check In',
        icon: 'lucide:scan-qr-code',
        to: '/check-in',
        render: false,
        disabled: true,
        child: [
            {
                title: 'Check-In Event',
                description: 'Check-in attendee by scanning their QR Code',
                label: 'Check-In Event',
                to: '/check-in/:event_id',
                render: false,
                disabled: true,
            },
        ],
    },

    {
        title: 'Reports',
        label: 'Reports',
        icon: 'lucide:chart-column-increasing',
        to: '/reports',
        render: true,
    },
    {
        title: 'Settings',
        label: 'Settings',
        icon: 'lucide:settings',
        to: '/settings',
        render: true,
    },
]
