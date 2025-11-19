<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\PlanPermission;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CreateStoreController extends Controller
{
    public function add()
    {
        $storePlan = Plan::all();
        $userIdsWithStore = Store::pluck('user_id')->toArray();
        $users = User::where('id', '!=', auth()->user()->id)->whereNotIn('id', $userIdsWithStore)->get();
        $storeName = Store::pluck('name')->toArray();

        return Inertia::render('super-admin/create-store/index', [
            'storePlan' => $storePlan,
            'users' => $users,
            'storeName' => $storeName,
        ]);
    }

    public function store(Request $request)
    {
        try {
            try {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|email|max:255',
                    'country' => 'required|string|max:255',
                    'phone' => 'required|numeric|digits_between:6,15',
                    'type' => 'required|in:public,protected',
                    'status' => 'required|in:active,inactive',
                    'plan_id' => 'required|exists:plans,id',
                    'user_id' => 'required|exists:users,id',
                    'bio' => 'required|string',
                    'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
                ]);
            } catch (\Illuminate\Validation\ValidationException $e) {
                Log::error($e->getMessage());
            }

            if (Store::where('user_id', $request->user_id)->exists()) {
                return response()->json([
                    'message' => 'User already has a store',
                ], 400);
            }

            $originalPlan = Plan::findOrFail($request->plan_id);

            $newPlan = $originalPlan->replicate();
            $newPlan->name = $originalPlan->name.' (Copy for Store: '.$request->name.')';
            $newPlan->save();

            $originalPermissions = PlanPermission::where('plan_id', $originalPlan->id)->get();

            foreach ($originalPermissions as $perm) {

                PlanPermission::create([
                    'plan_id'        => $newPlan->id,
                    'permission_id'  => $perm->permission_id,
                    'is_enabled'     => $perm->is_enabled,
                    'limit'          => $perm->limit,
                ]);
            }

            $slug = Str::slug($request->name);
            $uniqueSlug = $slug;
            $counter = 1;

            while (Store::where('slug', $uniqueSlug)->exists()) {
                $uniqueSlug = $slug.'-'.$counter;
                $counter++;
            }

            $planExpiryDate = now();
            if ($originalPlan->billing_cycle === 'monthly') {
                $planExpiryDate = now()->addMonth();
            } elseif ($originalPlan->billing_cycle === 'yearly') {
                $planExpiryDate = now()->addYear();
            }

            $store = Store::create([
                'name' => $request->name,
                'email' => $request->email,
                'country' => $request->country,
                'phone' => $request->phone,
                'slug' => $uniqueSlug,
                'type' => $request->type,
                'status' => $request->status,
                'bio' => $request->bio,
                'logo' => $request->file('logo')
                    ? $request->file('logo')->store('store-logos', 'public')
                    : null,
                'plan_id' => $newPlan->id,
                'user_id' => $request->user_id,
                'plan_expiry_date' => $planExpiryDate,
            ]);

            return redirect()->route('dashboard')->with('success', 'Store created successfully.');

        } catch (\Throwable $th) {
            return redirect()->back()->with('error', $th->getMessage());
        }
    }

}
