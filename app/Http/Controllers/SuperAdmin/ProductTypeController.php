<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
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

        Permission::firstOrCreate([
            'key' => $validated['name'].'_product',
            'description' => 'Can use ' . $validated['name'] . ' product',
        ]);

        $product_type->update([
            'name' => $validated['name'],
        ]);

        return redirect()->route('product-type.index')->with('success', 'brand updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product_type = ProductType::findOrFail($id);

        $product_type->delete();

        return redirect()->route('product-type.index')->with('success', 'brand deleted successfully!');
    }
}
