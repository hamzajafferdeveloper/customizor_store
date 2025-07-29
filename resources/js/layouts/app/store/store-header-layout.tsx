import { AppContent } from '@/components/super-admin/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/super-admin/app-shell';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';
import { StoreData } from '@/types/store';
import { StoreHeader } from '@/components/store/store-header';

export default function StoreHeaderLayout({ children, breadcrumbs, store }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[], store: StoreData }>) {
    return (
        <AppShell>
            <StoreHeader breadcrumbs={breadcrumbs} store={store} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
