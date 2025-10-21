import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

export default function BuyProduct({ products }: any) {
    console.log(products);
    return (
        <AppLayout>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <section className="grid grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.length > 0 &&
                    products.map((product: any) => (
                        <Card
                            key={product.product.id}
                            onClick={() =>
                                router.get(
                                    route(product.product.store_id === null ? 'product.show' : 'store.product.show', {
                                        slug: product.product.slug,
                                        storeId: product.product.store_id,
                                    }),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            className="relative min-w-0 cursor-pointer transition hover:bg-gray-200/90 dark:hover:bg-gray-800/90"
                        >
                            <CardHeader className="p-2">
                                <img src={`/storage/${product.product.image}`} alt={product.product.title} className="rounded-md object-cover" />
                            </CardHeader>
                            <CardContent className="flex flex-col">
                                <h1 className="font-semibold">{product.product.title}</h1>
                                {/* <div className="flex flex-wrap gap-2">
                                    {product.product.product_colors.map((color: any) => (
                                        <div key={color.id} className="h-5 w-5 rounded-md border" style={{ backgroundColor: color.color.hexCode }} />
                                    ))}
                                </div> */}
                            </CardContent>
                        </Card>
                    ))}
            </section>
            {products.length === 0 && (
                <div className="8] flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                    No Buyed Product Found
                </div>
            )}
        </AppLayout>
    );
}
