import type { AppRoute } from '../types/app'

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
]

export const APP_POC_ADMIN_ROUTES: string[] = [
    '/my-events',
    '/scan-page',
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
        isDefault: true,
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
                to: '/tenants/:id',
                child: [
                    {
                        title: 'Edit Tenant',
                        description: 'Update organization and subscription information',
                        label: 'Edit',
                        to: '/tenants/:id/edit',
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
                to: '/events/:id',
                child: [
                    {
                        title: 'Edit Event',
                        description: 'Update event and personnel information',
                        label: 'Edit',
                        to: '/events/:id/edit',
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
                to: '/members/:id',
                child: [
                    {
                        title: 'Edit Member',
                        description: 'Update member information',
                        label: 'Edit',
                        to: '/members/:id/edit',
                    },
                ],
            },
        ],
    },
    {
        title: 'Scan Page',
        label: 'Scan Page',
        icon: 'lucide:scan-qr-code',
        to: '/scan-page',
        render: false,
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
