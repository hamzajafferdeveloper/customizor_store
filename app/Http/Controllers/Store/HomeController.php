<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\LogoCategory;
use App\Models\Plan;
use Illuminate\Support\Facades\Storage;
use App\Models\SvgTemplate;
use App\Models\SvgTemplatePart;
use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductColors;
use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Str;

class HomeController extends Controller
{
    public function index(Request $request, string $storeId)
    {
        $store = Store::findOrFail($storeId);

        // Render the store dashboard view
        return Inertia::render('store/dashboard', [
            'title' => 'Store Dashboard',
            'store' => $store,
            'page_type' => 'store',
        ]);
    }

    public function products(Request $request, string $storeId)
    {
        $store = Store::with('banner')->findOrFail($storeId);

        $perPage = $request->input('per_page', 10);
        $query = Product::query();

        // Filter by category ID
        if ($request->has('category_id')) {
            $query->where('categories_id', $request->input('category_id'));
        }

        // Filter by product type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by selected color IDs
        if ($request->has('colors')) {
            $colorIds = explode(',', $request->input('colors'));
            $query->whereHas('productColors', function ($q) use ($colorIds) {
                $q->whereIn('color_id', $colorIds);
            });
        }

        $plan = $store->load('plan.permissions');
        $permissions = $plan->plan->permissions->pluck('key')->toArray();

        // Map permissions to product types
        $allowedTypes = [];
        if (in_array('simple_product', $permissions)) {
            $allowedTypes[] = 'simple';
        }
        if (in_array('starter_product', $permissions)) {
            $allowedTypes[] = 'starter';
        }
        if (in_array('pro_product', $permissions)) {
            $allowedTypes[] = 'pro';
        }
        if (in_array('ultra_product', $permissions)) {
            $allowedTypes[] = 'ultra';
        }

        // Fetch products based on allowed types
        $products = $query->whereIn('type', $allowedTypes)
            ->with('productColors.color')
            ->orderBy('id', 'DESC')
            ->paginate($perPage)
            ->withQueryString();
        $categories = Category::all();
        $colors = Color::all();

        // Render the store dashboard view
        return Inertia::render('store/product/index', [
            'store' => $store,
            'products' => $products,
            'categories' => $categories,
            'colors' => $colors,
        ]);
    }

    public function showProduct(string $storeId, string $slug)
    {
        $store = Store::findOrFail($storeId);
        $product = Product::where('slug', $slug)->with('productColors.color', 'template')->firstOrFail();

        // Render the store product detail view
        return Inertia::render('store/product/show', [
            'store' => $store,
            'product' => $product,
            'page_type' => 'store',
        ]);
    }

    public function createProduct(string $storeId)
    {
        $store = Store::findOrFail($storeId);
        $categories = Category::all();
        $colors = Color::all();

        // Render the create product view
        return Inertia::render('store/product/create', [
            'store' => $store,
            'categories' => $categories,
            'colors' => $colors,
        ]);
    }

    public function storeProduct(Request $request, string $storeId)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'sku' => 'required|string|max:100|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'price_type' => 'required|in:physical,digital',

            'sizes' => 'required|array|min:1',
            'sizes.*' => 'required|string|max:20',

            'materials' => 'required|array|min:1',
            'materials.*' => 'required|string|max:30',

            'colors' => 'required|array|min:1',
            'colors.*' => 'required|integer|exists:colors,id',

            'categories_id' => 'required|integer|exists:categories,id',

            'image' => 'required|file|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Create Unique Slug
        $originalSlug = Str::slug($request->title);
        $slug = $originalSlug;
        $count = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        // Filter Array
        $validated['sizes'] = array_filter($validated['sizes']);
        $validated['materials'] = array_filter($validated['materials']);
        $validated['colors'] = array_filter($validated['colors']);

        // Store Image
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '-' . $file->getClientOriginalName();
            $product_image = $file->storeAs('product', $filename, 'public');
        }

        // Create Product
        $product = Product::create([
            'title' => $validated['title'],
            'sku' => $validated['sku'],
            'slug' => $slug,
            'store_id' => $storeId,
            'price' => $validated['price'],
            'price_type' => $validated['price_type'],
            'user_id' => auth()->id(),
            'type' => 'simple',
            'image' => $product_image,
            'sizes' => json_encode(array_values($validated['sizes'])),
            'materials' => json_encode(array_values($validated['materials'])),
            'categories_id' => $validated['categories_id'],
        ]);

        foreach (array_filter($validated['colors']) as $colorId) {
            ProductColors::create([
                'product_id' => $product->id,
                'color_id' => $colorId,
            ]);
        }

        return redirect()->route('store.products', $storeId)->with('success', 'Product created successfully!');
    }

    public function editProduct(string $storeId, string $slug)
    {
        $store = Store::findOrFail($storeId);
        $product = Product::with('productColors.color')->where('slug', $slug)->where('store_id', $storeId)->firstOrFail();
        $categories = Category::all();
        $colors = Color::all();

        if ($product->user_id !== auth()->id()) {
            return redirect()->route('store.products', $storeId)->with('error', 'You do not have permission to edit this product.');
        }

        // Render the edit product view
        return Inertia::render('store/product/edit', [
            'store' => $store,
            'product' => $product,
            'categories' => $categories,
            'colors' => $colors,
        ]);
    }

    public function updateProduct(Request $request, string $storeId, string $id, )
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'sku' => 'required|string|max:255',
            'categories_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'sizes' => 'nullable|array',
            'materials' => 'nullable|array',
            'colors' => 'nullable|array',
            'image' => 'nullable|image|max:2048',
        ]);

        $product = Product::findOrFail($id);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            // Save new image
            $file = $request->file('image');
            $filename = time() . '-' . $file->getClientOriginalName();
            $product_image = $file->storeAs('product', $filename, 'public');

            $product->image = $product_image;
        }

        // Update product fields
        $product->title = $validated['title'];
        $product->price = $validated['price'];
        $product->sku = $validated['sku'];
        $product->categories_id = $validated['categories_id'];
        $product->sizes = $validated['sizes'];
        $product->materials = $validated['materials'];
        $product->save();

        // Sync product colors
        // Remove old colors
        ProductColors::where('product_id', $product->id)->delete();

        // Add new colors
        if (!empty($validated['colors'])) {
            foreach (array_filter($validated['colors']) as $colorId) {
                ProductColors::create([
                    'product_id' => $product->id,
                    'color_id' => $colorId,
                ]);
            }
        }

        return redirect()->route('store.products', $storeId)->with('success', 'Product updated successfully!');
    }

    public function destroyProduct(string $storeId, string $id)
    {
        $product = Product::findOrFail($id);

        // Delete related product colors
        ProductColors::where('product_id', $product->id)->delete();

        // Delete image from storage if exists
        if ($product->image) {
            Storage::disk('public')->delete($product->image);

        }

        // Delete the product
        $product->delete();

        return redirect()->route('store.products', $storeId)
            ->with('success', 'Product deleted successfully!');
    }

    public function addTemplate(string $storeId, string $slug)
    {
        $store = Store::findOrFail($storeId);
        $product = Product::where('slug', $slug)->where('store_id', $storeId)->firstOrFail();

        if ($product->user_id !== auth()->id()) {
            return redirect()->route('store.products', $storeId)->with('error', 'You do not have permission to add a template to this product.');
        }

        // Render the add template view
        return Inertia::render('store/product/add-template', [
            'store' => $store,
            'product' => $product,
        ]);
    }

    public function storeTemplate(Request $request, string $storeId, string $id)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string',
            'svg' => 'required|string',
            'parts' => 'required|array',
            'parts.*.id' => 'required|string',
            'parts.*.name' => 'required|string',
            'parts.*.protection' => 'required|boolean',
            'parts.*.isGroup' => 'required|boolean',
            'parts.*.color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/'],
        ]);

        $svgtemplate = SvgTemplate::create([
            'product_id' => $validated['product_id'],
            'name' => $validated['name'],
            'template' => $validated['svg'],
        ]);

        foreach ($validated['parts'] as $part) {
            $type = $part['protection'] ? 'protection' : 'leather';

            SvgTemplatePart::create([
                'part_id' => $part['id'],
                'template_id' => $svgtemplate->id,
                'type' => $type,
                'name' => $part['name'],
                'color' => $part['color'],
                'is_group' => $part['isGroup'],
            ]);
        }

        return redirect()->route('product.index')->with('success', 'Product SVG template added successfully!');
    }

    public function customizeProduct(string $storeId, string $id)
    {
        $store = Store::findOrFail($storeId);
        $storePermissions = Plan::with('permissions', 'fonts')->where('id', $store->plan_id)->first();
        $template = SvgTemplate::with('part')->findOrFail($id);
        $logoGallery = LogoCategory::with('logos')->get();
        return Inertia::render('store/customizer', [
            'store' => $store,
            'template' => $template,
            'logoGallery' => $logoGallery,
            'permissions' => $storePermissions,
        ]);
    }

}
