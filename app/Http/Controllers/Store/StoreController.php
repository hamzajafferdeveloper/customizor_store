<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreBanner;
use App\Models\StoreStripeKey;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function dashboard(){
        dd('Welcome To Dashboard');
    }

    public function allStoreofUser(string $id)
    {
        $stores = Store::where('user_id', $id)->get();

        if ($stores) {
            return response()->json([
                'data' => $stores
            ], 200);
        } else {
            return response()->json([
                'message' => 'No Store related to given user'
            ], 404);
        }
    }

    public function profile(string $storeId)
    {
        $store = Store::with('banner')->findOrFail($storeId);
        $stripeKey = StoreStripeKey::where('store_id', $store->id)->first();

        return Inertia::render('store/profile', [
            'store' => $store->load('plan'),
            'initialPublicKey' => $stripeKey ? $stripeKey->stripe_public_key : '',
            'initialSecretKey' => $stripeKey ? $stripeKey->stripe_secret_key : '',
        ]);
    }

    public function updateProfile(Request $request, string $storeId)
    {
        $store = Store::findOrFail($storeId);

        // Validate input dynamically
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:100',
            'bio' => 'sometimes|string|nullable',
            'type' => 'sometimes',
            'logo' => 'sometimes|file|image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB max
        ]);

        // Handle logo replacement if provided
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($store->logo && Storage::disk('public')->exists($store->logo)) {
                Storage::disk('public')->delete($store->logo);
            }

            // Store new logo
            $logoPath = $request->file('logo')->store('logos', 'public');
            $validated['logo'] = $logoPath;
        }

        // Update store data
        $store->update($validated);

        return redirect()->back();
    }

    public function banner(Request $request, string $storeId)
    {
        // Validate request
        $validated = $request->validate([
            'banner' => 'required|file|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Find existing banner for this store
        $storeBanner = StoreBanner::where('store_id', $storeId)->first();

        // Store the uploaded file in 'public/banners'
        $filePath = $request->file('banner')->store('banners', 'public');

        if ($storeBanner) {
            // If a banner exists, delete old file and update
            if ($storeBanner->banner && \Storage::disk('public')->exists($storeBanner->banner)) {
                \Storage::disk('public')->delete($storeBanner->banner);
            }

            $storeBanner->update([
                'path' => $filePath,
            ]);
        } else {
            // If no banner exists, create a new record
            StoreBanner::create([
                'store_id' => $storeId,
                'path' => $filePath,
            ]);
        }

        return redirect()->route('store.dashboard', $storeId)->with('success', 'Banner Added Or Updated Successfully');

    }

    public function updateStripe(Request $request, string $storeId)
    {
        // Validate request
        $validated = $request->validate([
            'stripe_public_key' => 'required|string|max:255',
            'stripe_secret_key' => 'required|string|max:255',
        ]);

        // Ensure the store exists
        $store = Store::findOrFail($storeId);

        // Check if Stripe keys already exist for this store
        $stripeKeys = StoreStripeKey::where('store_id', $storeId)->first();

        if ($stripeKeys) {
            // Update existing keys
            $stripeKeys->update([
                'stripe_public_key' => $validated['stripe_public_key'],
                'stripe_secret_key' => $validated['stripe_secret_key'],
            ]);
        } else {
            // Create new record
            StoreStripeKey::create([
                'store_id' => $store->id,
                'stripe_public_key' => $validated['stripe_public_key'],
                'stripe_secret_key' => $validated['stripe_secret_key'],
            ]);
        }

        // Return success response
        return back()->with('success', 'Stripe keys saved successfully.');
    }
}
