import { NavMain } from '@/components/super-admin/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { StoreData } from '@/types/store';
import { Link } from '@inertiajs/react';
import { Box, LayoutGrid, ShoppingBag } from 'lucide-react';
import AppLogo from '../app-logo';
import { NavStore } from './nav-store';

export function StoreSidebar({ store }: { store: StoreData }) {
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: `/${store.slug}/dashboard`,
            icon: LayoutGrid,
        },
        {
            title: 'Product',
            href: `/${store.slug}/products`,
            icon: Box,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={`/${store.slug}/dashboard`} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
