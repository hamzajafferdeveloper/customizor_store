import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BadgePlus,
    Box,
    Building,
    ChevronRight,
    Construction,
    FileType2Icon,
    Folder,
    Images,
    LayoutGrid,
    List,
    Palette,
    PanelTopDashed,
    Settings,
    Shapes,
    ShoppingBasket,
    Store,
} from 'lucide-react';
import { Fragment, useState } from 'react';
import AppLogo from '../app-logo';

const groupedNavItems: (NavItem | { group: string; items: NavItem[] })[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    {
        group: 'Products',
        items: [
            { title: 'Product Type', href: '/product-type', icon: Shapes },
            { title: 'Product', href: '/product', icon: Box },
            { title: 'Category', href: '/category', icon: List },
        ],
    },
    {
        group: 'Store',
        items: [
            { title: 'Add Store', href: '/create-store/add', icon: LayoutGrid },
            { title: 'All Store', href: '/all-stores', icon: Store },
        ],
    },
    { title: 'Buyed Product', href: '/buy-products', icon: PanelTopDashed },
    { title: 'Orders', href: '/order/index', icon: ShoppingBasket },
    { title: 'Plans', href: '/admin/plans', icon: Folder },
    { title: 'Color', href: '/color', icon: Palette },
    { title: 'LogoGallery', href: '/logo-gallery/category', icon: Images },
    { title: 'Create Your Own Product', href: '/create-your-own-product/index', icon: BadgePlus },
    { title: 'Brand', href: '/brand', icon: Building },
    { title: 'Fonts', href: '/font', icon: FileType2Icon },

    {
        group: 'General Setting',
        items: [
            { title: 'Settings', href: '/settings', icon: Settings },
            { title: 'Extra Permission Request', href: '/get-extra-permission-request', icon: Construction },
        ],
    },
];

export function AppSidebar() {
    // Track only one open group at a time
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    const toggleGroup = (groupName: string) => {
        setOpenGroup((prev) => (prev === groupName ? null : groupName));
    };

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
                <SidebarMenu>
                    {groupedNavItems.map((item, idx) => {
                        if ('group' in item) {
                            const isOpen = openGroup === item.group;
                            return (
                                <Fragment key={idx}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={() => toggleGroup(item.group)}
                                            className="flex w-full items-center justify-between"
                                            isActive={item.group === openGroup}
                                        >
                                            <span className="text-xs font-semibold text-gray-500 uppercase">{item.group}</span>
                                            <ChevronRight className={`h-3 w-3 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    {/* Dropdown container with smooth transition */}
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out`}
                                        style={{ maxHeight: isOpen ? `${item.items.length * 2.5}rem` : '0' }}
                                    >
                                        {item.items.map((subItem, subIdx) => (
                                            <SidebarMenuItem key={subIdx} className="pl-6">
                                                <SidebarMenuButton isActive={subItem.href === window.location.pathname} asChild>
                                                    <Link href={subItem.href} prefetch className="flex items-center">
                                                        <subItem.icon className="mr-2 h-4 w-4" />
                                                        {subItem.title}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </div>
                                </Fragment>
                            );
                        } else {
                            return (
                                <SidebarMenuItem key={idx}>
                                    <SidebarMenuButton isActive={item.href === window.location.pathname} asChild>
                                        <Link href={item.href} prefetch className="flex items-center">
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        }
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
