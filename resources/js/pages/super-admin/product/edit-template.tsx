import EditTemaplteSection from '@/components/sections/edit-templte-section';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { BreadcrumbItem } from '@/types';
import { Template } from '@/types/helper';
import { Head } from '@inertiajs/react';

const EditTemplate = ({ template }: { template: Template }) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Add Template',
            href: `/product/edit/template/template-id=${template.id}`,
        },
    ];
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Template" />
            <EditTemaplteSection template={template} />
        </SuperAdminLayout>
    );
    return <div>EditTemplate</div>;
};

export default EditTemplate;
