import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { allCountries } from 'country-telephone-data';
import { Check, ChevronsUpDown } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function CreateStore({ storeName }: { storeName: string[] }) {
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

    const [selectedCountryISO2, setSelectedCountryISO2] = useState('');
    const [open, setOpen] = useState(false);
    const [showNameUniqueError, setShowNameUniqueError] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('logo', e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (showNameUniqueError) {
            return;
        }

        post(route('store.store'), {
            forceFormData: true,
        });
    };

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setData('name', name);

        const exists = storeName.includes(name);
        setShowNameUniqueError(exists);
    };

    return (
        <AppLayout>
            <Head title="Create Store" />

            <div className="flex justify-center py-10">
                <Card className="w-full max-w-2xl shadow-lg">
                    <CardHeader>
                        <h2 className="text-center text-2xl font-bold">Create Your Store</h2>
                        <p className="text-center text-gray-500">Fill in the details below to create your store</p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Store Name */}
                            <div>
                                <Label htmlFor="name">Store Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Enter store name" />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            {/* Country & Phone */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                                                {data.country ? allCountries.find((c) => c.name === data.country)?.name : 'Select country...'}

                                                <ChevronsUpDown className="opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search framework..." className="h-9" />
                                                <CommandList>
                                                    <CommandEmpty>No framework found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {allCountries.map((c) => (
                                                            <CommandItem
                                                                key={c.name}
                                                                value={c.name}
                                                                onSelect={(currentValue) => {
                                                                    setData('country', currentValue);
                                                                    setSelectedCountryISO2(c.iso2);
                                                                    setOpen(false);
                                                                }}
                                                            >
                                                                {c.name}
                                                                <Check
                                                                    className={cn('ml-auto', data.country === c.name ? 'opacity-100' : 'opacity-0')}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <PhoneInput
                                        country={selectedCountryISO2}
                                        value={data.phone}
                                        onChange={(value, data) => {
                                            setData('phone', value);
                                        }}
                                        inputProps={{
                                            name: 'phone',
                                            id: 'phone',
                                            required: true,
                                        }}
                                    />
                                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>
                            </div>

                            {/* Logo */}
                            <div>
                                <Label htmlFor="logo">Logo</Label>
                                <Input id="logo" type="file" onChange={handleFileChange} />
                                {errors.logo && <p className="text-sm text-red-500">{errors.logo}</p>}
                            </div>

                            <div>
                                <Label>Store Type</Label>
                                <Select onValueChange={(value) => setData('type', value)} defaultValue="public">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="protected">Protected</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
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
                                {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
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
