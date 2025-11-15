<?php

namespace App\Http\Controllers\home;

use App\Http\Controllers\Controller;
use App\Mail\CheckSuccessfullMail;
use App\Mail\RenewSuccessfullMail;
use App\Mail\UpgradeSuccessfullMail;
use App\Models\PaymentDetail;
use App\Models\Plan;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Stripe\Checkout\Session as StripeSession;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentController extends Controller
{
    public function showPaymentForm($planId)
    {
        $user = auth()->user();

        if(Store::where('user_id', $user->id)->exists()){
            return redirect()->route('home')->with('error', 'You already have a store.');
        }

        $plan = Plan::findOrFail($planId);

        // If user is already paid, check if they already bought this plan
        if ($user->is_paid) {
            $paymentForPlan = PaymentDetail::where('user_id', $user->id)
                ->where('plan_id', $planId)
                ->where('type', 'new')
                ->first();

            if ($paymentForPlan) {
                $storeExists = Store::where('user_id', $user->id)
                    ->where('plan_id', $planId)
                    ->exists();

                if ($storeExists) {
                    return redirect()->route('home')->with('error', 'You already have a store for this plan. Please choose another plan.');
                } else {
                    return redirect()->route('store.create');
                }
            }
        }

        // Initialize Stripe
        Stripe::setApiKey(config('services.stripe.secret'));

        // Create a Stripe Checkout Session
        $session = StripeSession::create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'customer_email' => $user->email,
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd', // or your currency
                    'product_data' => [
                        'name' => $plan->name,
                    ],
                    'unit_amount' => $plan->price * 100, // in cents
                ],
                'quantity' => 1,
            ]],
            'success_url' => route('payment.confirmation', ['planId' => $planId]),
            'cancel_url' => route('home'),
        ]);

        // Redirect to Stripe Checkout
        return Inertia::location($session->url);
    }

    public function showUpgradeForm($storeSlug)
    {
        $plans = Plan::where('id', '!=', 1)->get();
        $store = Store::where('slug', $storeSlug)->first();

        $user = auth()->user();
        if ($store->user_id === $user->id) {
            return Inertia::render('home/payment/upgrade', [
                'stripeKey' => config('services.stripe.key'),
                'plans' => $plans,
                'storeId' => $store->id,
            ]);
        } else {
            return abort(403, 'Unathorized Access');
        }

    }

    public function showRenewForm($storeSlug)
    {
        $store = Store::where('slug', $storeSlug)->first();

        $plan = $store->load('plan');

        $user = auth()->user();
        if ($store->user_id === $user->id) {
            return Inertia::render('home/payment/renew', [
                'stripeKey' => config('services.stripe.key'),
                'plan' => $plan->plan,
                'storeId' => $store->id,
            ]);
        } else {
            return abort(403, 'Unathorized Access');
        }
    }

    /**
     * Create a Stripe Payment Intent
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function createIntent(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $intent = PaymentIntent::create([
            'amount' => $request->amount ?? 1999,
            'currency' => 'usd',
        ]);

        return response()->json(['clientSecret' => $intent->client_secret]);
    }

    public function confirmation(Request $request)
    {
        try {
            $plan = Plan::findOrFail($request->input('planId'));

            // Optional: Validate


            // Update user as paid
            $user = auth()->user();
            $user->is_paid = true;
            $user->save();

            // Store payment details
            $paymentDetail = new PaymentDetail;
            $paymentDetail->user_id = $user->id;
            $paymentDetail->plan_id = $plan->id;
            $paymentDetail->amount = $plan->price;
            $paymentDetail->type = 'new'; // Assuming this is a new payment
            $paymentDetail->save();

            Mail::to($user->email)->send(new CheckSuccessfullMail);

            return redirect()->route('store.create')->with('success', 'Payment successful!');
        } catch (\Exception $e) {
            return redirect()->route('home')->with('error', 'Payment failed!');
        }
    }

    public function upgradeConfirmation(Request $request)
    {
        // Optional: Validate
        $request->validate([
            'store_id' => 'required',
            'plan.id' => 'required|integer',
            'plan.price' => 'required|numeric',
        ]);

        // Update user as paid
        $user = auth()->user();
        $user->is_paid = true;
        $user->save();

        $store = Store::findOrFail($request->input('store_id'));

        $oldDetail = PaymentDetail::findOrFail($store->payment_detail_id);

        $oldDetail->update([
            'type' => 'upgrade',
        ]);

        // Store payment details
        $paymentDetail = new PaymentDetail;
        $paymentDetail->user_id = $user->id;
        $paymentDetail->plan_id = $request->input('plan.id');
        $paymentDetail->amount = $request->input('plan.price');
        $paymentDetail->type = 'upgrade';
        $paymentDetail->save();

        Mail::to($user->email)->send(new UpgradeSuccessfullMail);

        $plan = Plan::findOrFail($request->input('plan.id'));

        $expiryDate = $plan->billing_cycle === 'yearly'
            ? now()->addYear()->toDateString()
            : now()->addMonth()->toDateString();

        $store->update([
            'payment_detail_id' => $paymentDetail->id,
            'plan_id' => $request->input('plan.id'),
            'plan_expiry_date' => $expiryDate,
            'status' => 'active',
        ]);

        return redirect()->route('store.dashboard', $store->slug);
    }

    public function renewConfirmation(Request $request)
    {
        // Optional: Validate
        $request->validate([
            'store_id' => 'required',
            'plan.id' => 'required|integer',
            'plan.price' => 'required|numeric',
        ]);

        // Update user as paid
        $user = auth()->user();
        $user->is_paid = true;
        $user->save();

        // Store payment details
        $paymentDetail = new PaymentDetail;
        $paymentDetail->user_id = $user->id;
        $paymentDetail->plan_id = $request->input('plan.id');
        $paymentDetail->amount = $request->input('plan.price');
        $paymentDetail->type = 'upgrade'; // Assuming this is a new payment
        $paymentDetail->save();

        $store = Store::findOrFail($request->input('store_id'));

        $plan = Plan::findOrFail($request->input('plan.id'));

        $expiryDate = $plan->billing_cycle === 'yearly'
            ? now()->addYear()->toDateString()
            : now()->addMonth()->toDateString();

        $store->update([
            'payment_detail_id' => $paymentDetail->id,
            'plan_id' => $request->input('plan.id'),
            'plan_expiry_date' => $expiryDate,
            'status' => 'active',
        ]);

        Mail::to($user->email)->send(new RenewSuccessfullMail);

        return redirect()->route('store.dashboard', $store->slug);
    }
}
