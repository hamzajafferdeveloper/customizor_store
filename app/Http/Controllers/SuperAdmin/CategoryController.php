<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $query = Category::query();
        $categories = $query->orderBy('id', 'DESC')->paginate($perPage)->withQueryString();
        // Append product count to each category
        foreach ($categories as $category) {
            $category->products_count = Product::where('categories_id', $category->id)->count();
        }
        return Inertia::render('super-admin/category/index', [
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

        $category = Category::create([
            'name' => $validated['name'],
            'slug_short' => $validated['slug_short'],
        ]);

        return redirect()->back()->with('success', 'Category created successfully!');
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

        $category = Category::findOrFail($id);

        $category->update([
            'name' => $validated['name'],
            'slug_short' => $validated['slug_short'],
        ]);

        return redirect()->route('category.index')->with('success', 'Category updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);

        $category->delete();

        return redirect()->route('category.index')->with('success', 'Category deleted successfully!');
    }
}
