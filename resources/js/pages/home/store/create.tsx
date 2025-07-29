import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateStore() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        country: '',
        phone: '',
        logo: null as File | null,
        type: 'public',
        status: 'active',
        bio: '',
    });

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('logo', e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('store.store'), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Create Store" />

            <div className="flex justify-center py-10">
                <Card className="w-full max-w-2xl shadow-lg">
                    <CardHeader>
                        <h2 className="text-2xl font-bold text-center">Create Your Store</h2>
                        <p className="text-center text-gray-500">Fill in the details below to create your store</p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Store Name */}
                            <div>
                                <Label htmlFor="name">Store Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter store name"
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter store email"
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>

                            {/* Country & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        placeholder="Enter country"
                                    />
                                    {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                                </div>
                            </div>

                            {/* Logo */}
                            <div>
                                <Label htmlFor="logo">Logo</Label>
                                <Input id="logo" type="file" onChange={handleFileChange} />
                                {errors.logo && <p className="text-red-500 text-sm">{errors.logo}</p>}
                            </div>

                            {/* Type & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Store Type</Label>
                                    <Select onValueChange={(value) => setData('type', value)} defaultValue='public'>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">Public</SelectItem>
                                            <SelectItem value="protected">Protected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                                </div>

                                <div>
                                    <Label>Status</Label>
                                    <Select onValueChange={(value) => setData('status', value)} defaultValue="active">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <Label htmlFor="bio">About Your Store</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    placeholder="Describe your store"
                                />
                                {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                            </div>

                            {/* Submit */}
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Store'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
