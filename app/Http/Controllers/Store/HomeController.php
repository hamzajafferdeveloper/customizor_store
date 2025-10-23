<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\LogoCategory;
use App\Models\Plan;
use App\Models\Product;
use App\Models\ProductColors;
use App\Models\Store;
use App\Models\SvgTemplate;
use App\Models\SvgTemplatePart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $brands = Brand::all();

        // Render the create product view
        return Inertia::render('store/product/create', [
            'store' => $store,
            'categories' => $categories,
            'colors' => $colors,
            'brands' => $brands,
        ]);
    }

    public function storeProduct(Request $request, string $storeId)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'price_type' => 'required|in:physical,digital',
            'brand_id' => 'required|integer|exists:brands,id',
            'sizes' => 'required|array|min:1',
            'sizes.*' => 'required|string|max:20',
            'materials' => 'required|array|min:1',
            'materials.*' => 'required|string|max:30',
            'colors' => 'required|array|min:1',
            'colors.*' => 'required|integer|exists:colors,id',
            'categories_id' => 'required|integer|exists:categories,id',
            'image' => 'required|file|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $brand = Brand::findOrFail($request->brand_id);
        $category = Category::findOrFail($request->categories_id);

        // Create base slug using brand & category
        $rawSlug = $brand->slug_short.'-'.$category->slug_short;
        $originalSlug = Str::slug($rawSlug);
        $slug = $originalSlug;
        $count = 1;

        // Ensure unique slug
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug.''.$count;
            $count++;
        }

        // ✅ Generate Unique SKU
        // Example: BRN-CAT-0001
        $baseSku = strtoupper(substr($brand->slug_short, 0, 3)).''.strtoupper(substr($category->slug_short, 0, 3));
        $lastProduct = Product::where('sku', 'like', $baseSku.'%')->orderBy('id', 'desc')->first();

        if ($lastProduct) {
            // Extract last numeric part (e.g., BRN-CAT-0005 → 5)
            $lastNumber = (int) preg_replace('/\D/', '', substr($lastProduct->sku, -4));
            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '0001';
        }

        $sku = 'ANB'. '-' .  $baseSku.'-'.$nextNumber;

        // Clean up arrays
        $validated['sizes'] = array_filter($validated['sizes']);
        $validated['materials'] = array_filter($validated['materials']);
        $validated['colors'] = array_filter($validated['colors']);

        // Store Image
        $product_image = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time().'-'.$file->getClientOriginalName();
            $product_image = $file->storeAs('product', $filename, 'public');
        }

        // Create Product
        $product = Product::create([
            'title' => $validated['title'],
            'sku' => $sku, // ✅ Added SKU
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

        // Attach Colors
        foreach (array_filter($validated['colors']) as $colorId) {
            ProductColors::create([
                'product_id' => $product->id,
                'color_id' => $colorId,
            ]);
        }

        return redirect()->route('store.products', $storeId)
            ->with('success', 'Product created successfully!');
    }

    public function editProduct(string $storeId, string $slug)
    {
        $store = Store::findOrFail($storeId);
        $product = Product::with('productColors.color')->where('slug', $slug)->where('store_id', $storeId)->firstOrFail();
        $categories = Category::all();
        $colors = Color::all();
        $brands = Brand::all();

        if ($product->user_id !== auth()->id()) {
            return redirect()->route('store.products', $storeId)->with('error', 'You do not have permission to edit this product.');
        }

        // Render the edit product view
        return Inertia::render('store/product/edit', [
            'store' => $store,
            'product' => $product,
            'categories' => $categories,
            'colors' => $colors,
            'brands' => $brands,
        ]);
    }

    public function updateProduct(Request $request, string $storeId, string $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'price_type' => 'required|in:physical,digital',
            'brand_id' => 'required|integer|exists:brands,id',
            'categories_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'sizes' => 'nullable|array',
            'materials' => 'nullable|array',
            'colors' => 'nullable|array',
            'image' => 'nullable|image|max:2048',
        ]);

        $product = Product::findOrFail($id);

        // ✅ Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }

            // Save new image
            $file = $request->file('image');
            $filename = time().'-'.$file->getClientOriginalName();
            $product_image = $file->storeAs('product', $filename, 'public');
            $product->image = $product_image;
        }

        $brand = Brand::findOrFail($validated['brand_id']);
        $category = Category::findOrFail($validated['categories_id']);

        // ✅ Only regenerate slug if brand/category changed
        if ($product->brand_id !== $validated['brand_id'] || $product->categories_id !== $validated['categories_id']) {
            $rawSlug = $brand->slug_short.''.$category->slug_short;
            $originalSlug = Str::slug($rawSlug);
            $slug = $originalSlug;
            $count = 1;

            // Make sure it’s unique excluding current product
            while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $originalSlug.'-'.$count;
                $count++;
            }

            $product->slug = 'ANB'. '-' . $slug;
        }

        // ✅ Only regenerate SKU if brand/category changed
        if ($product->brand_id !== $validated['brand_id'] || $product->categories_id !== $validated['categories_id']) {
            $baseSku = strtoupper(substr($brand->slug_short, 0, 3)).''.strtoupper(substr($category->slug_short, 0, 3));
            $lastProduct = Product::where('sku', 'like', $baseSku.'%')->orderBy('id', 'desc')->first();

            if ($lastProduct) {
                $lastNumber = (int) preg_replace('/\D/', '', substr($lastProduct->sku, -4));
                $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $nextNumber = '0001';
            }

            $product->sku = 'ANB'. '-' . $baseSku.'-'.$nextNumber;
        }

        // ✅ Update product fields
        $product->title = $validated['title'];
        $product->price = $validated['price'];
        $product->brand_id = $validated['brand_id'];
        $product->price_type = $validated['price_type'];
        $product->categories_id = $validated['categories_id'];
        $product->sizes = ! empty($validated['sizes']) ? json_encode(array_values($validated['sizes'])) : json_encode([]);
        $product->materials = ! empty($validated['materials']) ? json_encode(array_values($validated['materials'])) : json_encode([]);
        $product->save();

        // ✅ Sync product colors
        ProductColors::where('product_id', $product->id)->delete();

        if (! empty($validated['colors'])) {
            foreach (array_filter($validated['colors']) as $colorId) {
                ProductColors::create([
                    'product_id' => $product->id,
                    'color_id' => $colorId,
                ]);
            }
        }

        return redirect()->route('store.products', $storeId)
            ->with('success', 'Product updated successfully!');
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
        // dd($request->all());
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string',
            'svg' => 'required|string', // assuming raw SVG string
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

        return redirect()->route('store.products', $storeId)->with('success', 'Product SVG template added successfully!');
    }

    public function editTemplate(string $storeId, string $id)
    {
        $store = Store::findOrFail($storeId);
        $template = SvgTemplate::with('part')->findOrFail($id);
        $product = Product::where('id', $template->product_id)->where('store_id', $storeId)->firstOrFail();

        if ((int) $product->store_id !== (int) $storeId) {
            return redirect()->route('store.products', $storeId)->with('error', 'You do not have permission to edit this template.');
        }

        // Render the edit template view
        return Inertia::render('store/product/edit-template', [
            'store' => $store,
            'template' => $template,
        ]);
    }

    public function updateTemplate(Request $request, string $storeId, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'svg' => 'required|string', // assuming raw SVG string
            'parts' => 'required|array',
            'parts.*.part_id' => 'required|string',
            'parts.*.name' => 'required|string',
            'parts.*.type' => 'required|string|in:leather,protection',
            'parts.*.is_group' => 'required|boolean',
            'parts.*.color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/'],
        ]);

        $template = SvgTemplate::findOrFail($id);
        $template->name = $validated['name'];
        $template->template = $validated['svg'];
        $template->save();

        // Update or create parts
        foreach ($validated['parts'] as $part) {
            $type = $part['protection'] ? 'protection' : 'leather';
            // $type = $part['protection'] ? 'protection' : 'leather';
            SvgTemplatePart::updateOrCreate(
                ['part_id' => $part['part_id'], 'template_id' => $template->id],
                [
                    'type' => $type,
                    'name' => $part['name'],
                    'color' => $part['color'],
                    'is_group' => $part['is_group'],
                ]
            );
        }

        return redirect()->route('store.products', $storeId)->with('success', 'Product SVG template updated successfully!');
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
