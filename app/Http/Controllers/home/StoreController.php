<?php

namespace App\Http\Controllers\home;

use App\Http\Controllers\Controller;
use App\Models\PaymentDetail;
use App\Models\Plan;
use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    public function create()
    {
        $user = auth()->user();

        if (!$user->is_paid) {
            return redirect()->route('home')->with('error', 'You must buy a store to create info of store.');
        }

        $storeName = Store::pluck('name')->toArray();

        return Inertia::render('home/store/create', [
            'title' => 'Create Store',
            'description' => 'Create your store to start selling products.',
            'storeName' => $storeName
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:stores,email',
            'country' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'type' => 'required|in:public,protected',
            'status' => 'required|in:active,inactive',
            'bio' => 'nullable|string|max:500',
        ]);

        $user = auth()->user();
        $paymentDetails = PaymentDetail::where('user_id', $user->id)
            ->where('type', 'new')
            ->first();

        $plan = Plan::findOrFail($paymentDetails->plan_id);

        $slug = Str::slug($request->name);
        $uniqueSlug = $slug;
        $counter = 1;

        while (Store::where('slug', $uniqueSlug)->exists()) {
            $uniqueSlug = $slug.'-'.$counter;
            $counter++;
        }

        $expiryDate = $plan->billing_cycle === 'yearly'
            ? now()->addYear()->toDateString()
            : now()->addMonth()->toDateString();

        try {
            $store = Store::create([
                'name' => $validatedData['name'],
                'user_id' => auth()->id(),
                'plan_id' => $paymentDetails->plan_id,
                'payment_detail_id' => $paymentDetails->id,
                'email' => $validatedData['email'],
                'country' => $validatedData['country'],
                'slug' => $uniqueSlug,
                'phone' => $validatedData['phone'],
                'plan_expiry_date' => $expiryDate,
                'logo' => $request->file('logo')
                    ? $request->file('logo')->store('store-logos', 'public')
                    : null,
                'type' => $validatedData['type'],
                'status' => $validatedData['status'],
                'bio' => $validatedData['bio'] ?? '',
            ]);

            return redirect()->to('/' . $store->slug . '/dashboard')->with('success', 'Store created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create store: ' . $e->getMessage()]);
        }
    }
}
