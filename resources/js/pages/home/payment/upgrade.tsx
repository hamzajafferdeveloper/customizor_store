import { Plan } from '@/types/data';
import { router } from '@inertiajs/react';
import {
    CardCvcElement,
    CardExpiryElement,
    CardNumberElement,
    Elements,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || 'pk_test_12345');

function PaymentForm({ plans, storeId }: { plans: Plan[]; storeId: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[0]); // default to first plan
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        if (!selectedPlan) {
            toast.error('Please select a plan');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // ✅ Step 1: Create PaymentIntent on server
            const res = await fetch('/payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    // @ts-ignore
                    amount: selectedPlan.price * 100, // Convert to cents
                    plan_id: selectedPlan.id,
                    store_id: storeId,
                }),
            });

            const { clientSecret } = await res.json();

            // ✅ Step 2: Confirm payment using Stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement)!,
                },
            });

            if (result.error) {
                setMessage(result.error.message || 'Payment failed');
                toast.error(result.error.message || 'Payment failed');
            } else if (result.paymentIntent?.status === 'succeeded') {
                setSuccess(true);
                setMessage('✅ Payment successful! Upgrading your plan...');

                console.log('store_id:', storeId,
                    'plan_id:', selectedPlan.id,)
                // ✅ Step 3: Update store plan via Inertia
                router.post('/upgrade/confirm', {
                    store_id: storeId,
                    // @ts-ignore
                    plan: selectedPlan,
                });

                toast.success('Payment successful! Your plan is being upgraded.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const elementStyle = {
        style: {
            base: {
                fontSize: '16px',
                color: '#111',
                '::placeholder': { color: '#888' },
            },
            invalid: { color: '#e53e3e' },
        },
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
            <h1 className="mb-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Upgrade Your Plan
            </h1>

            {/* ✅ Plan Selection Dropdown */}
            <div className="mb-4">
                <label className="mb-2 block font-medium text-gray-800 dark:text-white">
                    Select Plan
                </label>
                <select
                    value={selectedPlan.id}
                    onChange={(e) =>
                        setSelectedPlan(plans.find((p) => p.id === parseInt(e.target.value))!)
                    }
                    className="w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-white"
                >
                    {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                            {plan.name} - ${plan.price}/{plan.billing_cycle}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selected Plan Info */}
            <p className="mb-6 text-center text-gray-600 dark:text-gray-100">
                You will pay: <span className="font-semibold">${selectedPlan.price}</span> (
                {selectedPlan.billing_cycle})
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1 block font-medium text-gray-800 dark:text-white">Card Number</label>
                    <div className="rounded-lg border bg-gray-50 px-3 py-3 dark:bg-gray-800">
                        <CardNumberElement options={elementStyle} />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block font-medium text-gray-800 dark:text-white">Expiry Date</label>
                    <div className="rounded-lg border bg-gray-50 px-3 py-3 dark:bg-gray-800">
                        <CardExpiryElement options={elementStyle} />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block font-medium text-gray-800 dark:text-white">CVC</label>
                    <div className="rounded-lg border bg-gray-50 px-3 py-3 dark:bg-gray-800">
                        <CardCvcElement options={elementStyle} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105 dark:bg-white dark:text-black"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                        </>
                    ) : (
                        `Pay $${selectedPlan.price}`
                    )}
                </button>
            </form>

            {message && (
                <div
                    className={`mt-6 text-center text-lg font-medium ${
                        success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                >
                    {success && <CheckCircle className="mr-2 inline-block h-6 w-6" />}
                    {message}
                </div>
            )}
        </div>
    );
}

export default function UpgradeCheckout({
    plans,
    storeId,
}: {
    plans: Plan[];
    storeId: number;
}) {
    return (
        <Elements stripe={stripePromise}>
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-black">
                
                <PaymentForm plans={plans} storeId={storeId} />
            </div>
        </Elements>
    );
}
