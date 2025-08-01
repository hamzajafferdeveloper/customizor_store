import { NavUser } from '@/components/nav-user';
import { NavFooter } from '@/components/super-admin/nav-footer';
import { NavMain } from '@/components/super-admin/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Box, Component, FileType2Icon, Folder, Images, LayoutGrid, List, Palette } from 'lucide-react';
import AppLogo from '../app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Product',
        href: '/product',
        icon: Box,
    },
    {
        title: 'Category',
        href: '/category',
        icon: List,
    },
    {
        title: 'Color',
        href: '/color',
        icon: Palette,
    },

    {
        title: 'LogoGallery',
        href: '/logo-gallery/category',
        icon: Images,
    },
    {
        title: 'Plans',
        href: '/admin/plans',
        icon: Folder,
    },
    {
        title: 'Fonts',
        href: '/font',
        icon: FileType2Icon,
    },
        {
        title: 'Parts',
        href: '/parts/categories',
        icon: Component,
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
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
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
