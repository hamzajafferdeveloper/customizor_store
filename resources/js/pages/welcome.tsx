import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome() {
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
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="bg-white dark:bg-black text-black dark:text-white">
                {/* ✅ HERO SECTION */}
                <section
                    ref={heroRef}
                    className="m-10 flex flex-col items-center justify-center text-center px-6"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                        Design. Customize. Sell.
                    </h1>
                    <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
                        Create your own motorbike suits & gloves with our advanced customizer.
                        Build your store and share your designs with the world.
                    </p>

                    {/* CTAs */}
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <a
                            href="/product"
                            className="px-8 py-4 text-lg font-semibold bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-80 transition"
                        >
                            Start Customizing
                        </a>
                        <a
                            href="/pricing"
                            className="px-8 py-4 text-lg font-semibold bg-gray-100 text-black dark:bg-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            Create Your Store
                        </a>
                    </div>

                    {/* Hero Image */}
                    <div className="mt-14 max-w-4xl w-full">
                        <img
                            src="/storage/customizor.png"
                            alt="Motorbike Customizer"
                            className="rounded-2xl shadow-2xl"
                        />
                    </div>
                </section>

                {/* ✅ FEATURES */}
                <section
                    ref={featuresRef}
                    className="py-24 px-6 max-w-6xl mx-auto text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-12">
                        Powerful Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
                            <div
                                key={idx}
                                className="feature-card p-8 bg-gray-100 dark:bg-gray-900 rounded-xl shadow-md text-center"
                            >
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ✅ STORE PREVIEW */}
                <section
                    ref={storeRef}
                    className="py-4 px-6 bg-gray-50 dark:bg-gray-950 text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Create Your Store Instantly
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
                        Set up your online store in just a few clicks. Upload your designs.
                    </p>
                    <img
                        src="/storage/store.png"
                        alt="Store Preview"
                        className="mx-auto rounded-xl shadow-2xl max-w-4xl"
                    />
                </section>

                {/* ✅ FOOTER CTA */}
                <section className="py-16 bg-black text-white text-center dark:bg-white dark:text-black">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Start?</h2>
                    <p className="text-lg mb-8">
                        Create your custom gear and open your store today.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a
                            href="/product"
                            className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:opacity-80 transition"
                        >
                            Start Customizing
                        </a>
                        <a
                            href="/pricing"
                            className="px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg hover:opacity-80 transition"
                        >
                            Create Store
                        </a>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
