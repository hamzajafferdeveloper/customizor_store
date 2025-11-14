import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome() {
    const page = usePage<SharedData>();
    const { flash } = page.props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);
    const heroRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const storeRef = useRef<HTMLDivElement>(null);
    const pricingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero animation
            gsap.from(heroRef.current, {
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out',
            });

            // Features animation with stagger
            gsap.from('.feature-card', {
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: 'top 80%',
                },
                opacity: 0,
                y: 50,
                stagger: 0.2,
                duration: 1,
                ease: 'power3.out',
            });

            // Store Preview zoom-in
            gsap.from(storeRef.current, {
                scrollTrigger: {
                    trigger: storeRef.current,
                    start: 'top 80%',
                },
                opacity: 0,
                scale: 0.9,
                duration: 1.2,
                ease: 'power3.out',
            });

            // Pricing cards stagger
            gsap.from('.pricing-card', {
                scrollTrigger: {
                    trigger: pricingRef.current,
                    start: 'top 80%',
                },
                opacity: 0,
                y: 50,
                stagger: 0.2,
                duration: 1,
                ease: 'power3.out',
            });
        });

        return () => ctx.revert(); // Cleanup on unmount
    }, []);

    return (
        <AppLayout>
            <Head title="MotoDesign - Customize & Sell">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="">
                {/* ✅ HERO SECTION */}
                <section ref={heroRef} className="m-10 flex flex-col items-center justify-center px-6 text-center">
                    <h1 className="text-4xl leading-tight font-extrabold md:text-6xl">Design. Customize. Sell.</h1>
                    <p className="mt-6 max-w-2xl text-lg text-gray-700 dark:text-gray-300">
                        Create your own motorbike suits & gloves with our advanced customizer. Build your store and share your designs with the world.
                    </p>

                    {/* CTAs */}
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <a
                            href="/product"
                            className="rounded-lg bg-black px-8 py-4 text-lg font-semibold text-white transition hover:opacity-80 dark:bg-white dark:text-black"
                        >
                            Start Customizing
                        </a>
                        <a
                            href="/pricing"
                            className="rounded-lg bg-gray-100 px-8 py-4 text-lg font-semibold text-black transition hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                        >
                            Create Your Store
                        </a>
                    </div>

                    {/* Hero Image */}
                    <div className="mt-14 w-full max-w-4xl">
                        <img src="/storage/customizor.png" alt="Motorbike Customizer" className="rounded-2xl shadow-2xl" />
                    </div>
                </section>

                {/* ✅ FEATURES */}
                <section ref={featuresRef} className="mx-auto max-w-6xl px-6 py-24 text-center">
                    <h2 className="mb-12 text-3xl font-bold md:text-5xl">Powerful Features</h2>
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                        {[
                            {
                                title: 'Full Customization',
                                desc: 'Change every detail of your suit & gloves.',
                            },
                            {
                                title: 'Store Builder',
                                desc: 'Launch your own store in minutes.',
                            },
                            {
                                title: 'Live Preview',
                                desc: 'View realistic previews before publishing.',
                            },
                        ].map((feature, idx) => (
                            <div key={idx} className="feature-card rounded-xl bg-gray-100 p-8 text-center shadow-md dark:bg-gray-900">
                                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ✅ STORE PREVIEW */}
                <section ref={storeRef} className="px-6 py-4 text-center">
                    <h2 className="mb-6 text-3xl font-bold md:text-5xl">Create Your Store Instantly</h2>
                    <p className="mx-auto mb-12 max-w-2xl text-gray-600 dark:text-gray-300">
                        Set up your online store in just a few clicks. Upload your designs.
                    </p>
                    <img src="/storage/store.png" alt="Store Preview" className="mx-auto max-w-4xl rounded-xl shadow-2xl" />
                </section>

                {/* ✅ FOOTER CTA */}
                <section className="py-16 text-center">
                    <h2 className="mb-6 text-3xl font-bold md:text-5xl">Ready to Start?</h2>
                    <p className="mb-8 text-lg">Create your custom gear and open your store today.</p>
                    <div className="flex justify-center gap-4">
                        <a href="/product" className="rounded-lg bg-white px-8 py-4 font-semibold text-black transition hover:opacity-80">
                            Start Customizing
                        </a>
                        <a href="/pricing" className="rounded-lg bg-gray-700 px-8 py-4 font-semibold text-white transition hover:opacity-80">
                            Create Store
                        </a>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
