import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type Template } from "@/types/helper";
import Editor from '@/components/editor/editor';
import { LogoCategory, Permission } from "@/types/data";

export default function Customizer({ template, logoGallery, permissions }: { template: Template, logoGallery: LogoCategory[], permissions: Permission[] }) {

    return (
        <AppLayout>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <Editor template={template} logoGallery={logoGallery} permissions={permissions} />
        </AppLayout>
    );
}
