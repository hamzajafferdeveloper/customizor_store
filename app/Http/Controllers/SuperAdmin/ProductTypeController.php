<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Permission;

class ProductTypeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $query = ProductType::query();
        $product_types = $query->orderBy('id', 'DESC')->paginate($perPage)->withQueryString();

        foreach ($product_types as $product_type) {
            $product_type->products_count = Product::where('product_type_id', $product_type->id)->count();
        }

        return Inertia::render('super-admin/product-type/index', [
            'product_types' => $product_types,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:25',
        ]);

        Permission::firstOrCreate([
            'key' => $validated['name'].'_product',
            'description' => 'Can use ' . $validated['name'] . ' product',
        ]);

        ProductType::create([
            'name' => $validated['name'],
        ]);

        return redirect()->back()->with('success', 'brand created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:25',
        ]);

        $product_type = ProductType::findOrFail($id);

        // Find the old permission key before updating
        $oldPermissionKey = $product_type->name . '_product';

        // Update the Product Type
        $product_type->update([
            'name' => $validated['name'],
        ]);

        // Update the permission key and description
        $permission = Permission::where('key', $oldPermissionKey)->first();

        if ($permission) {
            $permission->update([
                'key' => $validated['name'] . '_product',
                'description' => 'Can use ' . $validated['name'] . ' product',
            ]);
        } else {
            // If not found, create it
            Permission::create([
                'key' => $validated['name'] . '_product',
                'description' => 'Can use ' . $validated['name'] . ' product',
            ]);
        }

        return redirect()->route('product-type.index')->with('success', 'Product type updated successfully!');
    }

    public function destroy(string $id)
    {
        $product_type = ProductType::findOrFail($id);

        // Delete related permission
        $permissionKey = $product_type->name . '_product';
        Permission::where('key', $permissionKey)->delete();

        // Delete product type
        $product_type->delete();

        return redirect()->route('product-type.index')->with('success', 'Product type and permission deleted successfully!');
    }
}
