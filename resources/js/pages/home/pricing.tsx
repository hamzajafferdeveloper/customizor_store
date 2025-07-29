import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Plan } from '@/types/data';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';

type Props = {
    plans: Plan[];
    title: string;
    description: string;
    buttonText: string;
    currency: string;
};

export default function Welcome({ plans, title, description, buttonText, currency }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

    const handleSelectPlan = (id: number) => {
        setSelectedPlan(id);
    };

    return (
        <AppLayout>
            <Head title="Pricing">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="">
                <div className="flex min-h-screen flex-col items-center px-4 py-10 lg:px-8">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl dark:text-white">{title}</h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">{description}</p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid w-full max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => {
                            const isSelected = selectedPlan === plan.id;
                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`flex cursor-pointer flex-col justify-between rounded-2xl border bg-white transition-all duration-300 hover:shadow-xl dark:bg-black ${
                                        isSelected ? 'scale-105 border-black shadow-2xl dark:border-white' : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                >
                                    {/* Header */}
                                    <div className="p-6">
                                        <h2 className="text-2xl font-semibold text-black dark:text-white">{plan.name}</h2>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                                    </div>

                                    {/* Price */}
                                    <div className="px-6">
                                        <p className="text-4xl font-bold text-black dark:text-white">
                                            {currency}
                                            {parseFloat(plan.price).toFixed(2)}
                                            <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/{plan.billing_cycle}</span>
                                        </p>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1 p-6">
                                        <ul className="space-y-3">
                                            {Array.isArray(plan.features) && plan.features.length > 0 ? (
                                                plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                                                        <Check className="mr-2 h-5 w-5 text-black dark:text-white" />
                                                        {feature}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-gray-500 dark:text-gray-400">No features listed.</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* CTA Button */}
                                    <div className="p-6">
                                        <Link
                                            href={isSelected ? (auth.user ? route('checkout.form', plan.id) : route('register')) : '#'}
                                            className={`rounded-xl py-3 font-semibold text-white transition-all ${
                                                isSelected
                                                    ? 'bg-black dark:bg-white dark:text-black'
                                                    : 'pointer-events-none cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                                            }`}
                                        >
                                            <button
                                                disabled={!isSelected}
                                                className="w-full"
                                            >
                                                {isSelected ? (auth.user ? 'Get Started' : 'Sign Up') : 'Select'}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Note */}
                    <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">{buttonText}</p>
                </div>
            </div>
        </AppLayout>
    );
}
