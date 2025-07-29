import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import StoreLayout from '@/layouts/store-layout';
import { SharedData } from '@/types';
import { StoreData } from '@/types/store';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const StoreProfile = ({ store }: { store: StoreData }) => {
    const page = usePage<SharedData>();
    const { flash } = page.props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const [formData, setFormData] = useState<StoreData>(store);
    const [openModal, setOpenModal] = useState(false);
    const [currentField, setCurrentField] = useState<keyof StoreData | null>(null);
    const [tempValue, setTempValue] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    const fields: { label: string; key: keyof StoreData; type?: 'text' | 'number' | 'email' | 'file'; visible: boolean }[] = [
        { label: 'Store Name', key: 'name', type: 'text', visible: true },
        { label: 'Email', key: 'email', type: 'email', visible: true },
        { label: 'Phone', key: 'phone', type: 'number', visible: true },
        { label: 'Country', key: 'country', type: 'text', visible: true },
        { label: 'Bio', key: 'bio', type: 'text', visible: true },
        { label: 'Logo', key: 'logo', type: 'file', visible: false }, // ✅ File type for logo
    ];

    const handleFieldClick = (field: keyof StoreData) => {
        setCurrentField(field);
        setTempValue(formData[field] ? String(formData[field]) : '');
        setSelectedFile(null);
        setFilePreview(null);
        setOpenModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        const data = new FormData();

        if (currentField === 'logo' && selectedFile) {
            data.append('logo', selectedFile);
        } else if (currentField) {
            data.append(currentField, tempValue);
        }

        // Send the request
        router.post(route('store.profile.update', store.id), data, {
            forceFormData: true,
            onSuccess: () => {
                if (currentField === 'logo' && selectedFile) {
                    setFormData((prev) => ({ ...prev, logo: selectedFile.name }));
                } else if (currentField) {
                    setFormData((prev) => ({ ...prev, [currentField]: tempValue }));
                }
                setOpenModal(false);
                toast.success(`Store profile updated successfully`);
            },
            onError: () => {
                toast.error('Failed to update store profile');
            },
        });
    };

    const getInputType = (field: keyof StoreData): 'text' | 'number' | 'email' | 'file' => {
        return fields.find((f) => f.key === field)?.type || 'text';
    };

    const currentLabel = currentField ? fields.find((f) => f.key === currentField)?.label : '';

    const handleTypeChange = (checked: boolean) => {
        const newType = checked ? 'protected' : 'public';

        const data = new FormData();
        data.append('type', newType);

        router.post(route('store.profile.update', store.id), data, {
            forceFormData: true,
            onSuccess: () => {
                setFormData((prev) => ({ ...prev, type: newType }));
                toast.success(`Store type changed to ${newType}`);
            },
            onError: () => {
                toast.error('Failed to update store type');
            },
        });
    };

    return (
        <StoreLayout store={store}>
            <Head title="Store Profile" />
            <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
                {/* Profile Header */}
                <div className="relative h-48 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-4 flex w-full flex-col items-center justify-center gap-4 text-center md:top-0 md:bottom-4 md:left-6 md:flex-row md:justify-start md:text-start">
                        <img
                            src={filePreview || `/storage/${formData.logo}` || '/placeholder.png'}
                            alt="Store Logo"
                            className="h-24 w-24 cursor-pointer rounded-full border-4 border-white object-cover shadow-lg transition hover:opacity-90"
                            onClick={() => handleFieldClick('logo')}
                        />
                        <div className="text-white">
                            <h1 className="text-2xl font-bold">{formData.name}</h1>
                            <p className="opacity-80">{formData.email}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Details Card */}
                <Card className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                    <div className="mb-4 flex w-full justify-between">
                        <h2 className="text-lg font-semibold">Store Details</h2>
                        <Badge className="bg-green-700 text-white">Editable</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {fields.map(
                            ({ label, key, visible }) =>
                                visible && (
                                    <div
                                        key={key}
                                        className="flex cursor-pointer items-center justify-between gap-2 rounded-md border p-3 transition hover:bg-muted"
                                        onClick={() => handleFieldClick(key)}
                                    >
                                        <p className="font-medium">{label}</p>
                                        <p className="max-w-[200px] truncate text-right text-muted-foreground">{formData[key] || 'Click to add'}</p>
                                    </div>
                                ),
                        )}
                    </div>
                </Card>

                {/* Account Info */}
                <Card className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                    <div className="mb-4 flex w-full justify-between">
                        <h2 className="text-lg font-semibold">Account Info</h2>
                        <Badge className="bg-red-700 text-white">System</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-semibold capitalize">{formData.status}</p>
                        </div>
                        <div>
                            <p className="mb-2 text-muted-foreground">Store Type</p>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">Public</span>
                                <Switch checked={formData.type === 'protected'} onCheckedChange={(checked) => handleTypeChange(checked)} />
                                <span className="text-sm font-medium">Protected</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Plan</p>
                            <p className="font-semibold">{store?.plan?.name}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Created At</p>
                            <p className="font-semibold">{new Date(formData.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </Card>

                <div className="flex w-full gap-2">
                    <Link className="w-1/2" href={route('upgrade.form', store.id)}>
                        <Button className="w-full">Upgrade</Button>
                    </Link>
                    <Link className="w-1/2" href={route('renew.form', store.id)}>
                        <Button className="w-full hover:bg-gray-800/20" variant="outline">
                            Renew
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit {currentLabel}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {currentField && (
                            <>
                                {getInputType(currentField) === 'file' ? (
                                    <div className="flex flex-col items-center gap-4">
                                        {filePreview ? (
                                            <img src={filePreview} alt="Preview" className="h-24 w-24 rounded-full border object-cover" />
                                        ) : (
                                            <img
                                                src={`/storage/${formData.logo}` || '/placeholder.png'}
                                                alt="Logo"
                                                className="h-24 w-24 rounded-full border object-cover"
                                            />
                                        )}
                                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                ) : currentField === 'bio' ? (
                                    <Textarea value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="w-full" />
                                ) : (
                                    <Input type={getInputType(currentField)} value={tempValue} onChange={(e) => setTempValue(e.target.value)} />
                                )}
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StoreLayout>
    );
};

export default StoreProfile;
