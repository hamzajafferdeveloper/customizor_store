
import { StoreSidebar } from '@/components/store/store-sidebar';
import { AppContent } from '@/components/super-admin/app-content';
import { AppShell } from '@/components/super-admin/app-shell';
import { AppSidebarHeader } from '@/components/super-admin/app-sidebar-header';
import { BreadcrumbItem } from '@/types';
import { StoreData } from '@/types/store';
import { type PropsWithChildren } from 'react';

export default function SuperAdminSidebarLayout({ children, breadcrumbs = [], store }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[], store: StoreData }>) {
    return (
        <AppShell variant="sidebar">
            <StoreSidebar store={store} />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs}  store={store}/>
                {children}
            </AppContent>
        </AppShell>
    );
}
