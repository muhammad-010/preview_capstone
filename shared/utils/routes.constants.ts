import type { AppRoute } from '../types/app'

export const SUPER_ADMIN_APP_ROUTES: string[] = [
    '/dashboard',
    '/tenants',
    '/settings',
]

export const TENANT_ADMIN_APP_ROUTES: string[] = [
    '/dashboard/event',
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
        label: 'Dashboard',
        icon: 'lucide:layout-dashboard',
        to: '/dashboard/event',
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
        title: 'Settings',
        label: 'Settings',
        icon: 'lucide:settings',
        to: '/settings',
        render: true,
    },
]
