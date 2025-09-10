import EditTemplateSection from '@/components/sections/edit-templte-section';
import StoreLayout from '@/layouts/store-layout';
import { Template } from '@/types/helper';
import { StoreData } from '@/types/store';
import { Head } from '@inertiajs/react';

type Props = {
    store: StoreData;
    template: Template;
};

export default function AddTemaplate({ store, template }: Props) {
    return (
        <StoreLayout store={store}>
            <Head title="Edit Temaplate"></Head>
            <EditTemplateSection template={template} store={store} />
        </StoreLayout>
    );
}
