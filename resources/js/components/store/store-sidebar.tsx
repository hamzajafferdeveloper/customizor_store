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
            href: `/${store.id}/dashboard`,
            icon: LayoutGrid,
        },
        {
            title: 'Product',
            href: `/${store.id}/products`,
            icon: Box,
        },

        {
            title: 'Orders',
            href: `/${store.id}/order/index`,
            icon: ShoppingBag,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={`/${store.id}/dashboard`} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavStore store={store} />
            </SidebarFooter>
        </Sidebar>
    );
}
