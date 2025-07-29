<?php

namespace App\Http\Controllers\home;

use App\Http\Controllers\Controller;
use App\Models\PaymentDetail;
use App\Models\Plan;
use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function showPaymentForm($planId)
    {
        $user = auth()->user();
        $plan = Plan::findOrFail($planId);

        // If user is not paid, show checkout page
        if (!$user->is_paid) {
            return Inertia::render('home/payment/checkout', [
                'stripeKey' => config('services.stripe.key'),
                'plan' => $plan,
            ]);
        }

        // If user is already paid
        if ($user->is_paid) {
            // Fetch user's payments
            $paymentDetails = PaymentDetail::where('user_id', $user->id)
                ->where('type', 'new')
                ->get();

            // ✅ Check if user has any payment with the given plan_id
            $paymentForPlan = $paymentDetails->firstWhere('plan_id', $planId);

            if ($paymentForPlan) {
                // ✅ Check if any store is linked with this plan_id for this user
                $storeExists = Store::where('user_id', $user->id)
                    ->where('plan_id', $planId)
                    ->exists();

                if ($storeExists) {
                    // If store already exists for this plan_id → redirect to payment page
                    return Inertia::render('home/payment/checkout', [
                        'stripeKey' => config('services.stripe.key'),
                        'plan' => $plan,
                        'message' => 'You already have a store for this plan. Please choose another plan.',
                    ]);
                } else {
                    // If payment exists but no store yet → redirect to store.create
                    return redirect()->route('store.create');
                }
            } else {
                // If no payment for this plan → show checkout page
                return Inertia::render('home/payment/checkout', [
                    'stripeKey' => config('services.stripe.key'),
                    'plan' => $plan,
                ]);
            }
        }

        return redirect()->route('home')->with('error', 'You are not authorized to access this page.');
    }

    /**
     * Create a Stripe Payment Intent
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createIntent(Request $request)
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $intent = \Stripe\PaymentIntent::create([
            'amount' => $request->amount ?? 1999,
            'currency' => 'usd',
        ]);


        return response()->json(['clientSecret' => $intent->client_secret]);
    }

    public function confirmation(Request $request)
    {
        // Optional: Validate
        $request->validate([
            'plan.id' => 'required|integer',
            'plan.price' => 'required|numeric',
        ]);

        // Update user as paid
        $user = auth()->user();
        $user->is_paid = true;
        $user->save();

        // Store payment details
        $paymentDetail = new \App\Models\PaymentDetail();
        $paymentDetail->user_id = $user->id;
        $paymentDetail->plan_id = $request->input('plan.id');
        $paymentDetail->amount = $request->input('plan.price');
        $paymentDetail->type = 'new'; // Assuming this is a new payment
        $paymentDetail->save();

        return redirect()->back()->with('success', 'Payment successful!');
    }

}
