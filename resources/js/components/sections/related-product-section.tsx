import { Button } from '@/components/ui/button';
import { Category, Product } from '@/types/data';
import { useEffect, useRef, useState } from 'react';

export default function RelatedProductsSection() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // ✅ new loading state

    // indicator position/width
    const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

    const navRef = useRef<HTMLElement | null>(null);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // fetch categories once
    useEffect(() => {
        fetch('/category-for-related-products')
            .then((response) => response.json())
            .then((data) => {
                const payload = Array.isArray(data) ? data : (data.categories ?? []);
                setCategories(payload);
                if ((payload ?? []).length > 0) {
                    setSelectedCategory(payload[0].id); // default select first
                }
            })
            .catch(() => setCategories([]));
    }, []);

    // fetch products for selected category
    useEffect(() => {
        if (!selectedCategory) return;
        setLoading(true); // ✅ start loading

        fetch(`/product-for-related-products?category=${selectedCategory}`)
            .then((response) => response.json())
            .then((data) => {
                const payload = Array.isArray(data) ? data : (data.products ?? []);
                setProducts(payload);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false)); // ✅ stop loading
    }, [selectedCategory]);

    // measure & position underline
    const repositionIndicator = () => {
        if (!navRef.current || !selectedCategory) {
            setIndicator((s) => ({ ...s, visible: false }));
            return;
        }

        const navRect = navRef.current.getBoundingClientRect();
        const idx = categories.findIndex((c) => c.id === selectedCategory);
        const btn = buttonRefs.current[idx];
        if (!btn) {
            setIndicator((s) => ({ ...s, visible: false }));
            return;
        }
        const btnRect = btn.getBoundingClientRect();
        const left = btnRect.left - navRect.left;
        const width = btnRect.width;
        setIndicator({ left, width, visible: true });
    };

    // reposition when categories or selection changes
    useEffect(() => {
        repositionIndicator();
        const onResize = () => repositionIndicator();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [categories, selectedCategory]);

    useEffect(() => {
        const t = setTimeout(repositionIndicator, 50);
        return () => clearTimeout(t);
    }, [categories]);

    return (
        <section className="mt-12 flex flex-col gap-6">
            {/* Category Tabs */}
            <header className="border-b px-3">
                <nav ref={navRef} className="relative flex items-end gap-8">
                    {categories.length === 0 && <div className="py-4 text-gray-400">No categories available</div>}

                    {categories.map((cat, i) => (
                        <button
                            key={cat.id}
                            ref={(el) => (buttonRefs.current[i] = el)}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`relative cursor-pointer pb-3 text-lg font-semibold transition-colors outline-none focus:outline-none ${
                                selectedCategory === cat.id ? 'text-black' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}

                    {/* Sliding underline / indicator */}
                    <div
                        aria-hidden
                        className={`absolute bottom-0 h-1 rounded-full bg-red-500 transition-transform duration-300 ease-in-out`}
                        style={{
                            transform: `translateX(${indicator.left}px)`,
                            width: indicator.width ? `${indicator.width}px` : '0px',
                            opacity: indicator.visible ? 1 : 0,
                        }}
                    />
                </nav>
            </header>

            {/* Products Grid */}
            <div className="min-h-[200px] grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center">
                {loading ? (
                    // ✅ show loading state
                    <div className="col-span-full flex flex-col items-center justify-center py-8 text-gray-500">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-red-500 mb-3"></div>
                        <span>Loading products...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="col-span-full py-4 text-gray-400">No products available</div>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className="flex flex-col items-center rounded-xl border border-gray-200 p-3 text-center shadow-sm transition hover:shadow-md dark:border-gray-700"
                        >
                            <img
                                src={`/storage/${product.image}`}
                                alt={product.slug}
                                className="mb-3 h-40 w-40 rounded-lg object-cover"
                            />
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {product.slug}
                            </h3>
                            <Button className="mt-2 w-full cursor-pointer">View</Button>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
