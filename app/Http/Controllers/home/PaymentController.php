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
use Stripe\PaymentIntent;
use Stripe\Stripe;

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

    public function showUpgradeForm($storeId)
    {
        $plans = Plan::where('id', '!=', 1)->get();
        $store = Store::findOrFail($storeId);

        $user = auth()->user();
        if ($store->user_id === $user->id) {
            return Inertia::render('home/payment/upgrade', [
                'stripeKey' => config('services.stripe.key'),
                'plans' => $plans,
                'storeId' => $storeId
            ]);
        } else {
            return abort(403, 'Unathorized Access');
        }

    }

    public function showRenewForm($storeId)
    {
        $store = Store::findOrFail($storeId);

        $plan = $store->load('plan');

        $user = auth()->user();
        if ($store->user_id === $user->id) {
            return Inertia::render('home/payment/renew', [
                'stripeKey' => config('services.stripe.key'),
                'plan' => $plan->plan,
                'storeId' => $storeId
            ]);
        } else {
            return abort(403, 'Unathorized Access');
        }
    }

    /**
     * Create a Stripe Payment Intent
     *
     * @param Request $request
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
        $paymentDetail = new PaymentDetail();
        $paymentDetail->user_id = $user->id;
        $paymentDetail->plan_id = $request->input('plan.id');
        $paymentDetail->amount = $request->input('plan.price');
        $paymentDetail->type = 'new'; // Assuming this is a new payment
        $paymentDetail->save();

        Mail::to($user->email)->send(new CheckSuccessfullMail());

        return redirect()->route('store.create')->with('success', 'Payment successful!');
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
            'type' => 'upgrade'
        ]);

        // Store payment details
        $paymentDetail = new PaymentDetail();
        $paymentDetail->user_id = $user->id;
        $paymentDetail->plan_id = $request->input('plan.id');
        $paymentDetail->amount = $request->input('plan.price');
        $paymentDetail->type = 'upgrade';
        $paymentDetail->save();

        Mail::to($user->email)->send(new UpgradeSuccessfullMail());

        $plan = Plan::findOrFail($request->input('plan.id'));

        $expiryDate = $plan->billing_cycle === 'yearly'
            ? now()->addYear()->toDateString()
            : now()->addMonth()->toDateString();

        $store->update([
            'payment_detail_id' => $paymentDetail->id,
            'plan_id' => $request->input('plan.id'),
            'plan_expiry_date' => $expiryDate,
            'status' => 'active'
        ]);

        return redirect()->route('store.dashboard', $request->input('store_id'));
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
        $paymentDetail = new PaymentDetail();
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
            'status' => 'active'
        ]);

        Mail::to($user->email)->send(new RenewSuccessfullMail());

        return redirect()->route('store.dashboard', $request->input('store_id'));
    }
}
