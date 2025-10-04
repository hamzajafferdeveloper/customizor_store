<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandController extends Controller
{
        public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $query = Brand::query();
        $categories = $query->orderBy('id', 'DESC')->paginate($perPage)->withQueryString();
        return Inertia::render('super-admin/brands/index', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:25',
            'slug_short' => 'required|string|max:25',

        ]);

        Brand::create([
            'name' => $validated['name'],
            'slug_short' => $validated['slug_short'],
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
            'slug_short' => 'required|string|max:25',
        ]);

        $brand = Brand::findOrFail($id);

        $brand->update([
            'name' => $validated['name'],
            'slug_short' => $validated['slug_short'],
        ]);

        return redirect()->route('brand.index')->with('success', 'brand updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $brand = Brand::findOrFail($id);

        $brand->delete();

        return redirect()->route('brand.index')->with('success', 'brand deleted successfully!');
    }
}
