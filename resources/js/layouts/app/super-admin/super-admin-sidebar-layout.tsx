import { AppContent } from '../../../components/super-admin/app-content';
import { AppShell } from '../../../components/super-admin/app-shell';
import { AppSidebar } from '../../../components/super-admin/app-sidebar';
import { AppSidebarHeader } from '../../../components/super-admin/app-sidebar-header';
import { type BreadcrumbItem } from '../../../types';
import { type PropsWithChildren } from 'react';

export default function SuperAdminSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
