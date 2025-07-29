import { SharedData, type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import AppHeaderLayout from './app/app-header-layout';
import SuperAdminSidebarLayout from './app/super-admin/super-admin-sidebar-layout';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    return (
        <>
            {auth?.user?.type === 'admin' ? (
                <SuperAdminSidebarLayout breadcrumbs={breadcrumbs} {...props}>
                    {children}
                    <ToastContainer />
                </SuperAdminSidebarLayout>
            ) : (
                <AppHeaderLayout breadcrumbs={breadcrumbs} {...props}>
                    {children}
                    <ToastContainer />
                </AppHeaderLayout>
            )}
        </>
    );
};
