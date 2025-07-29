<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StoreController extends Controller
{
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
        $store = Store::findOrFail($storeId);

        return Inertia::render('store/profile', [
            'store' => $store
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
}
