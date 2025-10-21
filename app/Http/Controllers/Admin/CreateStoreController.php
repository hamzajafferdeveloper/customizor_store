<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CreateStoreController extends Controller
{
    public function add()
    {
        $storePlan = Plan::all();
        $users = User::where('id', '!=', auth()->user()->id)->get();

        return Inertia::render('super-admin/create-store/index', [
            'storePlan' => $storePlan,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
                'email' => 'required|email',
                'country' => 'required',
                'phone' => 'required',
                'type' => 'required|in:public,protected',
                'status' => 'required|in:active,inactive',
                'bio' => 'required',
                'plan_id' => 'required|exists:plans,id',
                'user_id' => 'required|exists:users,id',
            ]);

            $plan = Plan::findOrFail($request->plan_id);

            // Determine expiry date based on billing cycle
            $planExpiryDate = now();
            if ($plan->billing_cycle === 'monthly') {
                $planExpiryDate = now()->addMonth();
            } elseif ($plan->billing_cycle === 'yearly') {
                $planExpiryDate = now()->addYear();
            }


            $store = Store::create([
                'name' => $request->name,
                'email' => $request->email,
                'country' => $request->country,
                'phone' => $request->phone,
                'type' => $request->type,
                'status' => $request->status,
                'bio' => $request->bio,
                'logo' => $request->file('logo')
                    ? $request->file('logo')->store('store-logos', 'public')
                    : null,
                'plan_id' => $request->plan_id,
                'user_id' => $request->user_id,
                'plan_expiry_date' => $planExpiryDate
            ]);

            return redirect()->route('dashboard')->with('success', 'Store created successfully.');

        } catch (\Throwable $th) {
            return redirect()->back()->with('error', $th->getMessage());
        }
    }
}
