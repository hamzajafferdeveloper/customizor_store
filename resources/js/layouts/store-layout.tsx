import { SharedData, type BreadcrumbItem } from '@/types';
import { StoreData } from '@/types/store';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import StoreSidebarLayout from './app/store/store-sidebar-layout';
import StoreHeaderLayout from './app/store/store-header-layout';

interface SuperAdminLayoutProps {
    children: ReactNode;
    store: StoreData;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, store, ...props }: SuperAdminLayoutProps) => {
    const { auth } = usePage<SharedData>().props;

    const isStoreAdmin = auth?.user?.id === store.user_id;
    const isSuperAdmin = auth?.user.type === 'admin'
    return (
        <>
            {isStoreAdmin || isSuperAdmin ? (
                <StoreSidebarLayout breadcrumbs={breadcrumbs} store={store} {...props}>
                    {children}
                    <ToastContainer />
                </StoreSidebarLayout>
            ) : (
                <StoreHeaderLayout breadcrumbs={breadcrumbs} store={store} {...props}>
                    {children}
                    <ToastContainer />
                </StoreHeaderLayout>
            )}
        </>
    );
};
