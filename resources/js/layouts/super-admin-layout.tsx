import SuperAdminLayoutTemplate from '@/layouts/app/super-admin/super-admin-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

interface SuperAdminLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: SuperAdminLayoutProps) => (
    <SuperAdminLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
        <ToastContainer />
    </SuperAdminLayoutTemplate>
);
