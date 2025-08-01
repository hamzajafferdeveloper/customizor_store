<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Models\Part;
use App\Models\PartsCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PartController extends Controller
{
    public function categories(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $query = PartsCategory::query();
        $categories = $query->orderBy('id', 'DESC')->paginate($perPage)->withQueryString();

        return Inertia::render('super-admin/parts/parts-category', [
            'categories' => $categories
        ]);
    }

    public function parts(Request $request, string $id)
    {
        $perPage = $request->input('per_page', 10);
        $query = Part::query();
        $parts = $query->where('parts_category_id', $id)->orderBy('id', 'DESC')->paginate($perPage)->withQueryString();
        $category = PartsCategory::findOrFail($id);

        return Inertia::render('super-admin/parts/parts', [
            'parts' => $parts,
            'category' => $category
        ]);
    }

    public function createCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        PartsCategory::create([
            'name' => $validated['name']
        ]);

        return redirect()->route('superadmin.parts.categories')->with('success', 'Category created successfully!');

    }

    public function editCategory(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = PartsCategory::findOrFail($id);

        $category->update([
            'name' => $validated['name']
        ]);

        return redirect()->route('superadmin.parts.categories')->with('success', 'Category updated successfully!');
    }

    public function destroyCategory(string $id)
    {
        $category = PartsCategory::findOrFail($id);

        $category->delete();

        return redirect()->route('superadmin.parts.categories')->with('success', 'Category updated successfully!');
    }

    public function createParts(Request $request, string $id)
    {
        $validated = $request->validate([
            'category_id' => 'required|integer|exists:parts_categories,id',
            'name' => 'required|string|max:20',
            'source' => 'required|file|image|mimes:jpeg,png,jpg|max:2048',
        ]);


        if ($request->hasFile('source')) {
            $file = $request->file('source');
            $filename = time() . '-' . $file->getClientOriginalName();
            $source = $file->storeAs('parts', $filename, 'public');
        }

        Part::create([
            'parts_category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'path' => $source,
        ]);

        return redirect()->route('superadmin.parts.index', $id)->with('success', 'Part created successfully!');
    }

    public function destroyPart(string $id)
    {
        $part = Part::findOrFail($id);

        if ($part->path && Storage::disk('public')->exists($part->path)) {
            Storage::disk('public')->delete($part->path);
        }

        $part->delete();

        return redirect()->back()->with('success', 'Part created successfully!');
    }
}
