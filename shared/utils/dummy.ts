import type { DummyTenant } from '../types/data'

export const t1 = {
    id: 1,
    tenantName: 'Acme Corp',
    adminEmail: 'admin@acmecorp.com ',
    adminName: 'John Doe',
    adminPhone: '+1 (555) 123-4567',
    billingAddress: '123 Innovation Dr, Tech City, CA',
    createdAt: '2026-01-01',
    events: 12,
    status: 'Active',
    registeredUsers: 45,
    plan: 'enterprise',
} as DummyTenant

export const t2 = {
    id: 2,
    tenantName: 'Globex Inc',
    adminEmail: 'admin@globex.com',
    adminName: 'Jane Smith',
    adminPhone: '+1 (555) 987-6543',
    billingAddress: '456 Innovation Dr, Tech City, CA',
    createdAt: '2026-02-02',
    status: 'Active',
    events: 9,
    registeredUsers: 50,
    plan: 'professional',
} as DummyTenant

export const t3 = {
    id: 3,
    tenantName: 'Initech',
    adminEmail: 'admin@initech.com',
    adminName: 'Peter Gibbons',
    adminPhone: '+1 (555) 111-2222',
    billingAddress: '789 Innovation Dr, Tech City, CA',
    createdAt: '2026-03-03',
    status: 'Inactive',
    events: 15,
    registeredUsers: 75,
    plan: 'starter',
} as DummyTenant

export const DUMMY_TENANTS: DummyTenant[] = [t1, t2, t3]

export const DUMMY_EMPTY_TENANT: DummyTenant = {
    id: 0,
    tenantName: '',
    status: 'Inactive',
}
