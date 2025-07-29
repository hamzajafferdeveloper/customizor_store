import { Plan } from '@/types/data';
import { router } from '@inertiajs/react';
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || 'pk_test_12345');

function PaymentForm({ plan, storeId }: { plan: Plan; storeId: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setMessage('');

        // Create PaymentIntent
        const res = await fetch('/payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                // @ts-ignore
                amount: plan.price * 100, // Convert to cents
                plan_id: plan.id,
            }),
        });

        const { clientSecret } = await res.json();

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
            setMessage('✅ Payment successful!');
            router.post('/renew/confirm', {
                store_id: storeId,
                // @ts-ignore
                plan: plan,
            });
            toast.success('Payment successful!');
        }

        setLoading(false);
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
            <h1 className="mb-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Renew Your Store</h1>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-100">
                Amount:{' '}
                <span className="font-semibold">
                    {plan.price}/{plan.billing_cycle}
                </span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Card Number */}
                <div>
                    <label className="mb-1 block font-medium text-gray-800 dark:text-white">Card Number</label>
                    <div className="rounded-lg border bg-gray-50 px-3 py-3 dark:bg-gray-800">
                        <CardNumberElement options={elementStyle} />
                    </div>
                </div>

                {/* Expiration Date */}
                <div>
                    <label className="mb-1 block font-medium text-gray-800 dark:text-white">Expiry Date</label>
                    <div className="rounded-lg border bg-gray-50 px-3 py-3 dark:bg-gray-800">
                        <CardExpiryElement options={elementStyle} />
                    </div>
                </div>

                {/* CVC */}
                <div>
                    <label className="mb-1 block font-medium text-gray-800 dark:text-white">CVC</label>
                    <div className="rounded-lg border bg-gray-50 px-3 py-3 dark:bg-gray-800">
                        <CardCvcElement options={elementStyle} />
                    </div>
                </div>

                {/* Submit Button */}
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
                        `Pay ${plan.price}/${plan.billing_cycle}`
                    )}
                </button>
            </form>

            {/* Payment Status */}
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

export default function Checkout({ plan, storeId }: { plan: Plan; storeId: number }) {
    return (
        <Elements stripe={stripePromise}>
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-black">
                <PaymentForm plan={plan} storeId={storeId} />
            </div>
        </Elements>
    );
}
