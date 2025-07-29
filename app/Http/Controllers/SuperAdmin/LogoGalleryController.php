<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\LogoCategory;
use App\Models\LogoGallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LogoGalleryController extends Controller
{
    public function category(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $query = LogoCategory::query();
        $categories = $query->orderBy('id', 'DESC')->paginate($perPage)->withQueryString();
        return Inertia::render('super-admin/logo-gallery/category', [
            'categories' => $categories
        ]);
    }

    public function storeCategory(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:20'
        ]);

        LogoCategory::create([
            'name' => $validatedData['name']
        ]);

        return redirect()->route('superadmin.logo.gallery.category')->with('success', 'Gallery Category created successfully!');
    }

    public function updateCategory(Request $request, String $id)
    {
        $category = LogoCategory::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'required|string|max:20'
        ]);

        $category->update([
            'name' => $validatedData['name']
        ]);

        return redirect()->route('superadmin.logo.gallery.category')->with('success', 'Gallery Category updated successfully!');
    }

    public function deleteCategory(String $id)
    {
        $category = LogoCategory::findOrFail($id);

        $category->delete();

        return redirect()->route('superadmin.logo.gallery.category')->with('success', 'Gallery Category created successfully!');

    }

    public function logo(Request $request, String $id)
    {
        $category = LogoCategory::findOrFail($id);
        $perPage = $request->input('per_page', 10);
        $query = LogoGallery::query();
        $logos = $query->orderBy('id', 'DESC')->where('category_id', $category->id)->paginate($perPage)->withQueryString();
        return Inertia::render('super-admin/logo-gallery/logo', [
            'category' => $category,
            'logos' => $logos
        ]);
    }

    public function storeLogo(Request $request)
    {
        // Validate other fields first
        $validatedData = $request->validate([
            'category_id' => 'required|integer|exists:logo_categories,id',
            'name' => 'required|string|max:20',
        ]);

        // Determine if source is a file or SVG string
        if ($request->hasFile('source')) {
            $file = $request->file('source');
            $filename = time() . '-' . $file->getClientOriginalName();
            $source = $file->storeAs('logo-gallery', $filename, 'public');
        } else {
            // Validate SVG string input
            $request->validate([
                'source' => 'required|string'
            ]);
            $source = $request->input('source'); // Store SVG content
        }

        // Save the logo
        LogoGallery::create([
            'category_id' => $validatedData['category_id'],
            'name' => $validatedData['name'],
            'source' => $source,
        ]);

        return redirect()->route('superadmin.logo.gallery', $validatedData['category_id'])->with('success', 'Logo added successfully!');
    }

    public function deleteLogo(String $id)
    {
        $logo = LogoGallery::findOrFail($id);

        if($logo->source){
            Storage::disk('public')->delete($logo->source);
        }

        $logo->delete();

        return redirect()->back()->with('success', 'Logo added successfully!');
    }
}
