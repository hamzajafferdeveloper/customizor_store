import Editor from '@/components/editor/editor';
import AppLayout from '@/layouts/app-layout';
import StoreLayout from '@/layouts/store-layout';
import { AllowedPermission, LogoCategory, Permission } from '@/types/data';
import { type Template } from '@/types/helper';
import { StoreData } from '@/types/store';
import { Head } from '@inertiajs/react';

type Props = {
    template: Template;
    logoGallery: LogoCategory[];
    permissions: AllowedPermission;
    store: StoreData;
};

export default function Customizer({ template, logoGallery, permissions, store }: Props) {
    return (
        <StoreLayout store={store}>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <Editor template={template} logoGallery={logoGallery} permissions={permissions} />
        </StoreLayout>
    );
}
