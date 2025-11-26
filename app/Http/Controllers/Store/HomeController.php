<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\LogoCategory;
use App\Models\Permission;
use App\Models\Plan;
use App\Models\Product;
use App\Models\ProductColors;
use App\Models\ProductType;
use App\Models\Store;
use App\Models\SvgTemplate;
use App\Models\SvgTemplatePart;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Str;

class HomeController extends Controller
{
    public function index(Request $request, string $storeSlug)
    {
        $store = Store::where('slug', $storeSlug)->first();

        // Render the store dashboard view
        return Inertia::render('store/dashboard', [
            'title' => 'Store Dashboard',
            'store' => $store,
            'page_type' => 'store',
        ]);
    }

    public function products(Request $request, string $storeSlug)
    {
        $store = Store::with('banner')->where('slug', $storeSlug)->first();

        $perPage = $request->input('per_page', 10);
        $query = Product::query();

        // Filter by category ID
        if ($request->has('category_id')) {
            $query->where('categories_id', $request->input('category_id'));
        }

        // Filter by product type
        if ($request->has('type')) {
            $query->where('product_type_id', $request->input('type'));
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
        $extraPermissions = $store->extraPermissions()
            ->with('permission')
            ->get()
            ->pluck('permission.key')
            ->filter()
            ->toArray();

        $permissions = array_merge($permissions, $extraPermissions);

        $allPermissions = Permission::pluck('key')->toArray();

        $availablePermission = collect($allPermissions)
            ->filter(fn ($p) => str_ends_with($p, '_product'))
            ->values()
            ->all();

        // Map permissions to product types
        $allowedTypes = array_values(array_intersect($availablePermission, $permissions));

        // dd($allowedTypes);

        $productTypeIds = ProductType::whereIn('name', str_replace('_product', '', $allowedTypes))
            ->pluck('id');

        $products = $query
            ->whereIn('product_type_id', $productTypeIds)
            ->orWhere('store_id', $store->id)
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
            'product_types' => ProductType::all(),
            'page_type' => 'store',
        ]);
    }

    public function showProduct(string $storeSlug, string $sku)
    {
        $store = Store::where('slug', $storeSlug)->first();
        $product = Product::where('sku', $sku)->with('productColors.color', 'template')->firstOrFail();
        $buyedProducts = get_buyed_products();

        // Render the store product detail view
        return Inertia::render('store/product/show', [
            'store' => $store,
            'product' => $product,
            'page_type' => 'store',
            'buyedProducts' => $buyedProducts,
        ]);
    }

    public function createProduct(string $storeSlug)
    {
        try {

            $store = Store::where('slug', $storeSlug)->first();
            $plan = $store->load('plan.permissions');
            $productsPermissions = $plan->plan->permissions()->where('key', 'products')->get();
            // dd($productsPermissions);
            if ($productsPermissions->isEmpty()) {
                return redirect()->route('store.products', $storeSlug)->with('error', 'You do not have permission to create products.');
            }

            $productLimit = $productsPermissions->first()->pivot->limit;

            $numberOfProducts = Product::where('store_id', $store->id)->count();
            if ($numberOfProducts >= $productLimit) {
                return redirect()->route('store.products', $storeSlug)->with('error', 'You have reached the maximum limit of products.');
            }

            // dd($store);
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
        } catch (Exception $e) {
            return redirect()->route('store.products', $storeSlug)->with('error', 'UnExpected Error.');
        }
    }

    public function storeProduct(Request $request, string $storeSlug)
    {

        try {
            $store = Store::where('slug', $storeSlug)->first();
            $plan = $store->load('plan.permissions');
            $productsPermissions = $plan->plan->permissions()->where('key', 'products')->get();
            $productLimit = $productsPermissions->first()->pivot->limit;

            $numberOfProducts = Product::where('store_id', $store->id)->count();
            if ($numberOfProducts >= $productLimit) {
                return redirect()->route('store.products', $storeSlug)->with('error', 'You have reached the maximum limit of products.');
            }

            $validated = $request->validate([
                'title' => 'required|string|max:100',
                'price' => 'required|numeric|min:0',
                'price_type' => 'required|in:physical,digital',
                // 'brand_id' => 'nullable|integer|exists:brands,id',
                'sizes' => 'required|array|min:1',
                'sizes.*' => 'required|string|max:20',
                'materials' => 'required|array|min:1',
                'materials.*' => 'required|string|max:30',
                'colors' => 'required|array|min:1',
                'colors.*' => 'required|integer|exists:colors,id',
                'categories_id' => 'required|integer|exists:categories,id',
                'image' => 'required|file|image|mimes:jpeg,png,jpg,webp|max:2048',
            ]);

            // $brand = Brand::findOrFail($request->brand_id);
            $category = Category::findOrFail($request->categories_id);

            // ✅ Create base slug
            $rawSlug = $category->slug_short;
            $originalSlug = Str::slug($rawSlug);
            $slug = $originalSlug;
            $count = 1;

            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug.'-'.$count;
                $count++;
            }

            $categoryShort = strtoupper(substr($category->slug_short, 0, 3));

            // SKU prefix
            $prefix = "ANB-" . $categoryShort . "-";

            // Find last SKU in this group
            $lastProduct = Product::where('sku', 'like', $prefix . '%')
                ->orderBy('sku', 'desc')
                ->first();

            if ($lastProduct && preg_match('/(\d{4})$/', $lastProduct->sku, $match)) {
                // Get last number and increase
                $nextNumber = str_pad(((int)$match[1]) + 1, 4, '0', STR_PAD_LEFT);
            } else {
                // First SKU
                $nextNumber = '0001';
            }

            $sku = $prefix . $nextNumber;

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
                'slug' => $sku,
                'store_id' => $store->id,
                'price' => $validated['price'],
                'price_type' => $validated['price_type'],
                'user_id' => auth()->id(),
                'product_type_id' => null,
                'image' => $product_image,
                'sizes' => json_encode(array_values($validated['sizes'])),
                'materials' => json_encode(array_values($validated['materials'])),
                'categories_id' => $validated['categories_id'],
                'brand_id' => null,
            ]);

            // Attach Colors
            foreach (array_filter($validated['colors']) as $colorId) {
                ProductColors::create([
                    'product_id' => $product->id,
                    'color_id' => $colorId,
                ]);
            }

            return redirect()->route('store.products', $storeSlug)
                ->with('success', 'Product created successfully!');
        } catch (\Exception $e) {
            return redirect()->route('store.products', $storeSlug)->with('error', 'UnExpected Error: '.$e->getMessage());
        }
    }

    public function editProduct(string $storeSlug, string $sku)
    {
        $store = Store::where('slug', $storeSlug)->first();
        $product = Product::with('productColors.color')->where('sku', $sku)->where('store_id', $store->id)->firstOrFail();
        $categories = Category::all();
        $colors = Color::all();
        $brands = Brand::all();

        if ($product->user_id !== auth()->id()) {
            return redirect()->route('store.products', $storeSlug)->with('error', 'You do not have permission to edit this product.');
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

    public function updateProduct(Request $request, string $storeSlug, string $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'price_type' => 'required|in:physical,digital',
            'brand_id' => 'nullable|integer|exists:brands,id',
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

        // $brand = Brand::findOrFail($validated['brand_id']);
        $category = Category::findOrFail($validated['categories_id']);

        if ($product->categories_id != $validated['categories_id']) {

            // Use product title for slug
            $originalSlug = Str::slug($validated['title']);
            $slug = $originalSlug;
            $count = 1;

            while (
                Product::where('slug', $slug)
                    ->where('id', '!=', $product->id)
                    ->exists()
            ) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }

            // No need to force ANB- in slug. If you still want it:
            // $product->slug = 'ANB-' . $slug;
            $product->slug = $slug;
        }


        // ===============================
        // REGENERATE SKU (if brand or category changed)
        // ===============================
        if (
            $product->brand_id != $validated['brand_id'] ||
            $product->categories_id != $validated['categories_id']
        ) {
            // Category short code – first 3 letters
            $categoryShort = strtoupper(substr($category->slug_short, 0, 3));

            // SKU prefix
            $prefix = "ANB-{$categoryShort}-";

            // Find last SKU matching the pattern
            $lastProduct = Product::where('sku', 'like', $prefix . '%')
                ->orderBy('sku', 'desc')
                ->first();

            if ($lastProduct && preg_match('/(\d{4})$/', $lastProduct->sku, $match)) {
                $nextNumber = str_pad(((int)$match[1]) + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $nextNumber = '0001';
            }

            $product->sku = $prefix . $nextNumber;
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

        return redirect()->route('store.products', $storeSlug)
            ->with('success', 'Product updated successfully!');
    }

    public function destroyProduct(string $storeSlug, string $id)
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

        return redirect()->route('store.products', $storeSlug)
            ->with('success', 'Product deleted successfully!');
    }

    public function addTemplate(string $storeSlug, string $slug)
    {
        $store = Store::where('slug', $storeSlug)->first();
        $product = Product::where('slug', $slug)->where('store_id', $store->id)->firstOrFail();

        if ($product->user_id !== auth()->id()) {
            return redirect()->route('store.products', $storeSlug)->with('error', 'You do not have permission to add a template to this product.');
        }

        // Render the add template view
        return Inertia::render('store/product/add-template', [
            'store' => $store,
            'product' => $product,
        ]);
    }

    public function storeTemplate(Request $request, string $storeSlug, string $id)
    {
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

        return redirect()->route('store.products', $storeSlug)->with('success', 'Product SVG template added successfully!');
    }

    public function editTemplate(string $storeSlug, string $id)
    {
        $store = Store::where('slug', $storeSlug)->first();
        $template = SvgTemplate::with('part')->findOrFail($id);
        $product = Product::where('id', $template->product_id)->where('store_id', $store->id)->firstOrFail();


        if ((int) $product->store_id !== (int) $store->id) {
            return redirect()->route('store.products', $storeSlug)->with('error', 'You do not have permission to edit this template.');
        }

        // Render the edit template view
        return Inertia::render('store/product/edit-template', [
            'store' => $store,
            'template' => $template,
        ]);
    }

    public function updateTemplate(Request $request, string $storeSlug, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'svg' => 'required|string',
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

        return redirect()->route('store.products', $storeSlug)->with('success', 'Product SVG template updated successfully!');
    }

    public function customizeProduct(string $storeSlug, string $id)
    {
        $store = Store::where('slug', $storeSlug)->first();
        $storePermissions = Plan::with('permissions', 'fonts')
            ->where('id', $store->plan_id)
            ->first();

        $planPermissions = $storePermissions
            ? $storePermissions->permissions->pluck('key')->toArray()
            : [];
        $extraPermissions = $store->extraPermissions()
            ->with('permission')
            ->get()
            ->pluck('permission.key')
            ->filter()
            ->toArray();

        $allPermissions = array_unique(array_merge($planPermissions, $extraPermissions));

        $template = SvgTemplate::with('part')->findOrFail($id);
        $logoGallery = LogoCategory::with('logos')->get();

        return Inertia::render('store/customizer', [
            'store' => $store,
            'template' => $template,
            'logoGallery' => $logoGallery,
            'permissions' => $allPermissions,
        ]);
    }
}
