import { SharedData } from '@/types';
import AppLogoIcon from './super-admin/app-logo-icon';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
     const siteTitle = usePage<SharedData>().props.site_title || 'ANB Graphics';
    return (
        <>
            <div className="flex aspect-square items-center justify-center rounded-md">
                <AppLogoIcon/>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">{siteTitle}</span>
            </div>
        </>
    );
}
