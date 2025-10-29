import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import StoreLayout from '@/layouts/store-layout';
import { decodeBase64 } from '@/lib/utils';
import { SharedData } from '@/types';
import { StoreData } from '@/types/store';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, EyeOff, PenBox } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const StoreProfile = ({ store, initialPublicKey, initialSecretKey }: { store: StoreData; initialPublicKey: string; initialSecretKey: string }) => {
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
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(store.banner ? `/storage/${store.banner.path}` : null);
    const [publicKey, setPublicKey] = useState(initialPublicKey);
    const [secretKey, setSecretKey] = useState(initialSecretKey);
    const [showSecret, setShowSecret] = useState(false);
    const [password, setPassword] = useState<string>(decodeBase64(store.store_key || '') || '');

    const BannerRef = useRef<HTMLInputElement | null>(null);

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

    const handleStripeSave = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('stripe_public_key', publicKey);
        data.append('stripe_secret_key', secretKey);

        router.post(route('store.stripe.update', store.id), data, {
            forceFormData: true,
            onSuccess: () => {
                // Optionally show a toast
            },
            onError: () => {
                // Optionally show a toast
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

    const handlePasswordSave = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('password', password);

        router.post(route('store.password.update', store.id), data, {
            forceFormData: true,
            onSuccess: () => {
                // toast.success('Password updated successfully');
            },
            onError: () => {
                // toast.error('Failed to update password');
            },
        });
    }

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setBannerFile(file);

            // Generate preview
            const previewURL = URL.createObjectURL(file);
            setBannerPreview(previewURL);

            // If you want to send immediately:
            const formData = new FormData();
            formData.append('banner', file);

            router.post(route('store.banner', store.id), formData);
        }
    };

    return (
        <StoreLayout store={store}>
            <Head title="Store Profile" />
            {/* Profile Header */}
            <div className="relative">
                {/* Gradient Banner */}
                <div
                    className="flex h-56 w-full justify-end gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-center text-white"
                    style={{
                        backgroundImage: bannerPreview ? `url(${bannerPreview})` : '',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <input type="file" accept="image/*" ref={BannerRef} className="hidden" onChange={handleBannerChange} />
                    <PenBox className="m-2 cursor-pointer" onClick={() => BannerRef.current?.click()} />
                </div>

                {/* Logo Section */}
                <div className="absolute inset-x-0 -bottom-20 flex justify-center">
                    <img
                        src={filePreview ? filePreview : formData.logo ? `/storage/${formData.logo}` : '/placeholder.png'}
                        alt="Store Logo"
                        className="h-44 w-44 cursor-pointer rounded-full border-4 border-white object-cover shadow-lg transition hover:opacity-90"
                        onClick={() => handleFieldClick('logo')}
                    />
                </div>
            </div>

            <div className="mx-auto mt-24 grid max-w-6xl grid-cols-1 gap-8 p-4 sm:grid-cols-2">
                {/* Store Details */}
                <Card className="w-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                    <div className="mb-4 flex w-full justify-between">
                        <h2 className="text-lg font-semibold">Store Details</h2>
                        <Badge className="bg-green-700 text-white">Editable</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                {/* Stripe Payment Keys */}
                <Card className="w-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                    <div className="mb-4 flex w-full justify-between">
                        <h2 className="text-lg font-semibold">Stripe Payment Keys</h2>
                        <Badge className="bg-green-700 text-white">Editable</Badge>
                    </div>
                    <form onSubmit={handleStripeSave} className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <Label>Publishable Key</Label>
                            <Input type="text" value={publicKey} onChange={(e) => setPublicKey(e.target.value)} placeholder="Enter publishable key" />
                        </div>
                        <div className="relative flex flex-col gap-1">
                            <Label>Secret Key</Label>
                            <Input
                                type={showSecret ? 'text' : 'password'}
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                placeholder="Enter secret key"
                            />
                            <button
                                type="button"
                                className="absolute top-[30px] right-2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowSecret(!showSecret)}
                            >
                                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <Button type="submit" className="mt-2 w-full">
                            Save
                        </Button>
                    </form>
                </Card>

                {/* Password & Users */}
                <Card className="w-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                    <div className="mb-4 flex w-full justify-between">
                        <h2 className="text-lg font-semibold">Password & Users</h2>
                        <Badge className="bg-green-700 text-white">Editable</Badge>
                    </div>
                    <form onSubmit={handlePasswordSave} className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <Label>Password</Label>
                            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
                        </div>
                        <Button type="submit" className="mt-2 w-full">
                            Save
                        </Button>
                    </form>
                </Card>

                {/* Account Info */}
                <Card className="w-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                    <div className="mb-4 flex w-full justify-between">
                        <h2 className="text-lg font-semibold">Account Info</h2>
                        <Badge className="bg-red-700 text-white">System</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-semibold capitalize">{formData.status || 'N/A'}</p>
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
                            <p className="font-semibold">{store?.plan?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Created At</p>
                            <p className="font-semibold">{formData.created_at ? new Date(formData.created_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                </Card>

                {/* Buttons */}
                <div className="flex w-full flex-col gap-3 sm:col-span-2 sm:flex-row">
                    <Link className="w-full sm:w-1/2" href={route('upgrade.form', store.id)}>
                        <Button className="w-full">Upgrade</Button>
                    </Link>
                    <Link className="w-full sm:w-1/2" href={route('renew.form', store.id)}>
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
