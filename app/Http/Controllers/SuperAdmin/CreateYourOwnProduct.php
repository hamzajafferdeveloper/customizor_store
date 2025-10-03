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
            ]);

            // ✅ Handle file upload if exists
            $imagePath = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time().'-'.uniqid().'.'.$file->getClientOriginalExtension();
                $imagePath = $file->storeAs('create_own_product', $filename, 'public');
            }

            // ✅ Save product
            $product = \App\Models\CreateYourOwnProduct::create([
                'category_id' => $validated['category_id'],
                'image' => $imagePath,
            ]);

            return redirect()
                ->back()
                ->with('success', 'Create Own Product Image created successfully!');
        } catch (\Throwable $e) {
            // 🔴 Log full error
            Log::error('Create Own Product Image destroy failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Something went wrong. Please try again later.');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Validate input
            $validated = $request->validate([
                'category_id' => 'required|exists:categories,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            // Find record
            $cop = \App\Models\CreateYourOwnProduct::findOrFail($id);

            // Handle new image if uploaded
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($cop->image && \Storage::disk('public')->exists($cop->image)) {
                    Storage::disk('public')->delete($cop->image);
                }

                // Save new image with unique name
                $file = $request->file('image');
                $filename = time().'-'.uniqid().'.'.$file->getClientOriginalExtension();
                $path = $file->storeAs('create_own_product', $filename, 'public');

                $validated['image'] = $path;
            }

            // Update DB
            $cop->update($validated);

            return redirect()
                ->back()
                ->with('success', 'Product updated successfully!');
        } catch (\Exception $e) {
            Log::error('CreateOwnProduct update failed', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Something went wrong. Please try again later.');
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
