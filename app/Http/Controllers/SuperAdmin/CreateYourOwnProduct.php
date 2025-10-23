<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CreateYourOwnProduct extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        $create_own_product = \App\Models\CreateYourOwnProduct::with('category')->orderBy('id', 'desc')->paginate($perPage);
        $categories = Category::all();

        return Inertia::render('super-admin/create-your-own-product/index', ['categories' => $categories, 'CreateOwnProduct' => $create_own_product]);
    }

    public function store(Request $request)
    {
        try {
            // ✅ Validate request
            $validated = $request->validate([
                'category_id' => 'required|integer|exists:categories,id|unique:create_your_own_products,category_id',
                'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
                'template' => 'nullable|mimes:svg,svg+xml|max:2048',
            ]);

            $imagePath = null;
            $templatePath = null;

            // ✅ Handle image upload
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time().'-'.uniqid().'.'.$file->getClientOriginalExtension();
                $imagePath = $file->storeAs('create_own_product', $filename, 'public');
            }

            // ✅ Handle SVG template upload
            if ($request->hasFile('template')) {
                $file = $request->file('template');
                $templatename = time().'-'.uniqid().'.'.$file->getClientOriginalExtension();
                $templatePath = $file->storeAs('create_own_product/template', $templatename, 'public');
            }

            // ✅ Save product
            \App\Models\CreateYourOwnProduct::create([
                'category_id' => $validated['category_id'],
                'image' => $imagePath,
                'template' => $templatePath,
            ]);

            return redirect()->back()->with('success', 'Create Own Product created successfully!');

        } catch (\Throwable $e) {
            Log::error('Create Own Product store failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return redirect()->back()->with('error', 'Something went wrong. Please try again later.');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'category_id' => 'required|exists:categories,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'template' => 'nullable|mimes:svg,svg+xml|max:4096',
            ]);

            $cop = \App\Models\CreateYourOwnProduct::findOrFail($id);

            // ✅ If image uploaded — delete old & store new
            if ($request->hasFile('image')) {

                if ($cop->image && Storage::disk('public')->exists($cop->image)) {
                    Storage::disk('public')->delete($cop->image);
                }

                $file = $request->file('image');
                $filename = time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
                $validated['image'] = $file->storeAs('create_own_product', $filename, 'public');
            } else {
                unset($validated['image']); // ✅ keep old one
            }

            // ✅ If template uploaded — delete old & store new
            if ($request->hasFile('template')) {

                if ($cop->template && Storage::disk('public')->exists($cop->template)) {
                    Storage::disk('public')->delete($cop->template);
                }

                $file = $request->file('template');
                $filename = time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
                $validated['template'] = $file->storeAs('create_own_product/template', $filename, 'public');
            } else {
                unset($validated['template']); // ✅ keep old one
            }

            // ✅ Update database
            $cop->update($validated);

            return back()->with('success', 'Product updated successfully!');
        } catch (\Throwable $e) {

            Log::error('CreateYourOwnProduct update failed', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Something went wrong. Please try again.');
        }
    }

    public function destroy(string $id)
    {
        try {
            $cop = \App\Models\CreateYourOwnProduct::findOrFail($id);

            if ($cop->image) {
                Storage::disk('public')->delete($cop->image);
            }

            $cop->delete();

            return redirect()->back()->with('success', 'Logo added successfully!');

        } catch (\Exception $e) {
            Log::error('Create Own Product Image destroy failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Something went wrong. Please try again later.');
        }
    }
}
