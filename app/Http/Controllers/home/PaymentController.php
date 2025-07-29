<?php

namespace App\Http\Controllers\home;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function showPaymentForm($planId)
    {
        $user = auth()->user();

        if (!$user->is_paid) {
            $plan = Plan::findOrFail($planId);

            return Inertia::render('home/payment/checkout', [
                'stripeKey' => config('services.stripe.key'),
                'plan' => $plan,
            ]);
        } elseif ($user->is_paid) {
            if ($user->with('store')->count() > 0) {
                return redirect()->route('store.create');
            } else {
                return redirect()->route('home')->with('error', 'You already have a store.');
            }
        } else {
            dd('You are not authorized to access this page.');
            return redirect()->route('home')->with('error', 'You are not authorized to access this page.');
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
