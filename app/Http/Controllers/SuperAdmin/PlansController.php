<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlansController extends Controller
{
    public function index()
    {
        $plans = Plan::with('permissions')->get();
        $permissions = Permission::all();

        foreach ($plans as $plan) {
            $store = $plan->stores()->first();
            if ($store) {
                $plan->store_id = $store->id;
                $plan->store_name = $store->name;
            }
        }

        // Logic to display plans
        return Inertia::render('super-admin/plans/index', [
            'plans' => $plans, // Fetch plans from the database or service
            'permissions' => $permissions, // Fetch permissions for the plans
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'billing_cycle' => 'required|string',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
        ]);

        // ✅ Create plan (create() auto-saves, so no ->save())
        $plan = Plan::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'billing_cycle' => $data['billing_cycle'],
            'features' => $data['features'] ?? [],
        ]);

        return redirect()->route('superadmin.plans.index')
            ->with('success', 'Plan and associated role created successfully.');
    }

    public function update(Request $request, $id)
    {
        // Logic to update an existing plan
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'billing_cycle' => 'required|string', // e.g., monthly, yearly
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
        ]);

        $plan = Plan::findOrFail($id);

        $plan->update([
            'name' => $data['name'],
            'description' => $data['description'],
            'price' => $data['price'],
            'billing_cycle' => $data['billing_cycle'],
            'features' => $data['features'], // Update features as JSON
        ]);

        return redirect()->route('superadmin.plans.index')->with('success', 'Plan updated successfully.');
    }

    public function destroy($id)
    {
        // Logic to delete a plan
        $plan = Plan::findOrFail($id);
        $plan->delete();

        return redirect()->route('superadmin.plans.index')->with('success', 'Plan deleted successfully.');
    }

    public function updatePermissions(Request $request, Plan $plan)
    {
        $permissions = $request->input('permissions', []); // [permission_id => ['is_enabled'=>true,'limit'=>2]]

        $syncData = [];
        foreach ($permissions as $id => $data) {
            $syncData[$id] = [
                'is_enabled' => $data['is_enabled'] ?? false,
                'limit' => $data['limit'] ?? null,
            ];
        }

        $plan->permissions()->sync($syncData);

        return back()->with('success', 'Permissions updated successfully.');
    }

    public function updateStatus(string $id, Request $request)
    {
        try {
            $plan = Plan::findOrFail($id);

            $plan->update([
                'display' => $request->display,
            ]);

            return back()->with('success', 'Plan status updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update plan status.');
        }
    }
}
