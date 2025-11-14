import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { StoreData } from '@/types/store';
import { Head, Link } from '@inertiajs/react';
import { Store } from 'lucide-react';
import { useState } from 'react';

interface StoreType {
    id: number;
    name: string;
    email: string;
    image?: string;
    status: string;
    plan?: string;
}

interface Props {
    stores: StoreData[];
}

export default function StoresPage({ stores }: Props) {
    const [search, setSearch] = useState('');

    const filteredStores = stores.filter((store) => store.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <AppLayout>
            <Head title="Stores" />
            <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col items-center justify-between sm:flex-row">
                        <h1 className="mb-4 flex items-center gap-2 text-3xl font-bold text-gray-800 sm:mb-0">
                            <Store className="text-blue-600" /> All Stores
                        </h1>
                        <Input
                            placeholder="Search store..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white shadow-sm sm:w-72"
                        />
                    </div>

                    {filteredStores.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">No stores found 😕</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {filteredStores.map((store) => (
                                <Card
                                    key={store.slug}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-xl"
                                >
                                    <CardHeader className="p-0">
                                        <div className="relative">
                                            <span
                                                className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs ${
                                                    store.type === 'public' ? 'bg-green-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                                                }`}
                                            >
                                                {store.type}
                                            </span>
                                            <img
                                                src={`/storage/${store.logo}` || 'https://placehold.co/600x400/EEE/31343C?text=No+Image'}
                                                alt={store.name}
                                                className="h-40 w-full object-cover"
                                            />
                                            <span
                                                className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs ${
                                                    store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                                }`}
                                            >
                                                {store.status}
                                            </span>

                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <CardTitle className="mb-1 text-lg font-semibold text-gray-800">{store.name}</CardTitle>
                                        <p className="mb-1 text-sm text-gray-500">{store.email}</p>
                                        <p className="mb-4 text-sm text-gray-500">Total Products: {store.total_products}</p>

                                        <Link href={`/${store.slug}/products`} className="block">
                                            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">View Store</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
