import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function BuyProduct({ products, selectedUrlType }: any) {
    const navRef = useRef<HTMLElement | null>(null);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [selectedType, setSelectedType] = useState(selectedUrlType);

    const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

    const types = [
        { id: 'digital', name: 'Digital' },
        { id: 'physical', name: 'Physical' },
    ];

    return (
        <AppLayout>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <header className="border-b px-4 mt-4 md:px-6">
                <nav ref={navRef} className="no-scrollbar relative flex items-end gap-6 overflow-x-auto pb-2">
                    {types.map((cat, i) => (
                        <button
                            key={cat.id}
                            ref={(el) => (buttonRefs.current[i] = el)}
                            onClick={() => {
                                setSelectedType(cat.id); // for underline indicator

                                // Update URL & reload page via Inertia
                                router.get(window.location.pathname, { product_type: cat.id }, { preserveState: true, replace: true });
                            }}
                            className={`relative cursor-pointer pb-2 text-lg font-semibold whitespace-nowrap transition-colors duration-200 outline-none focus:outline-none ${
                                selectedType === cat.id ? 'text-black' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}

                    {/* Sliding underline / indicator */}
                    <div
                        aria-hidden
                        className="absolute bottom-0 h-1 rounded-full bg-red-500 transition-all duration-300 ease-in-out"
                        style={{
                            transform: `translateX(${indicator.left}px)`,
                            width: indicator.width ? `${indicator.width}px` : '0px',
                            opacity: indicator.visible ? 1 : 0,
                        }}
                    />
                </nav>
            </header>
            <section className="grid grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.length > 0 && (
                    <>
                        {selectedType === 'physical'
                            ? products.map((product: any) => (
                                  <Card
                                      key={product.id}
                                      onClick={() =>
                                          router.get(
                                              route('buy.physical.product.show', {
                                                  id: product.id,
                                              }),
                                              {},
                                              { preserveScroll: true },
                                          )
                                      }
                                      className="relative min-w-0 cursor-pointer transition hover:bg-gray-200/90 dark:hover:bg-gray-800/90"
                                  >
                                      <CardHeader className="p-2">
                                          <img
                                              src={`/storage/${product.file}`}
                                              alt={product.product.title}
                                              className="rounded-md h-full w-full object-cover"
                                          />
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
                              ))
                            : products.map((product: any) => (
                                  <Card
                                      key={product.product.id}
                                      onClick={() =>
                                          router.get(
                                              route(product.product.store_id === null ? 'product.show' : 'store.product.show', {
                                                  sku: product.product.sku,
                                                  storeSlug: product.product.store?.slug,
                                              }),
                                              {},
                                              { preserveScroll: true },
                                          )
                                      }
                                      className="relative min-w-0 cursor-pointer transition hover:bg-gray-200/90 dark:hover:bg-gray-800/90"
                                  >
                                      <CardHeader className="p-2">
                                          <img
                                              src={`/storage/${product.product.image}`}
                                              alt={product.product.title}
                                              className="rounded-md object-cover"
                                          />
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
                    </>
                )}
            </section>
            {products.length === 0 && (
                <div className="8] flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                    No Buyed Product Found
                </div>
            )}
        </AppLayout>
    );
}
