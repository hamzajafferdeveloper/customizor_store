import CreateProductEditor from '@/components/create-product/create-product';
import AppLayout from '@/layouts/app-layout';
import { AllowedPermission, LogoCategory, PartCategroyWithPart } from '@/types/data';
import { type Template } from '@/types/helper';
import { Head } from '@inertiajs/react';

export default function CreateOwnProduct({
    template,
    logoGallery,
    permissions,
    parts,
}: {
    template: Template;
    logoGallery: LogoCategory[];
    permissions: AllowedPermission;
    parts: PartCategroyWithPart[];
}) {
    return (
        <AppLayout>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <CreateProductEditor template={template} logoGallery={logoGallery} permissions={permissions} parts={parts} />
        </AppLayout>
    );
}
