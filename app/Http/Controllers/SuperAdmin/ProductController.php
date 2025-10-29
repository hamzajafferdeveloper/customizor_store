<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\CreateYourOwnProduct;
use App\Models\LogoCategory;
use App\Models\PartsCategory;
use App\Models\Plan;
use App\Models\Product;
use App\Models\ProductColors;
use App\Models\SvgTemplate;
use App\Models\SvgTemplatePart;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
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

        $products = $query->where('store_id', null)->with('productColors.color')->orderBy('id', 'DESC')->paginate($perPage)->withQueryString();
        $categories = Category::with('ownProductImage')->get();
        $colors = Color::all();

        return Inertia::render('home/product/index', [
            'products' => $products,
            'categories' => $categories,
            'colors' => $colors,
            'page_type' => 'home',
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::all();
        $colors = Color::all();
        $brands = Brand::all();

        return Inertia::render('super-admin/product/create', [
            'catogories' => $categories,
            'colors' => $colors,
            'brands' => $brands,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            // Removed required sku from user input — will be auto-generated
            'type' => 'required|string|in:simple,starter,pro,ultra',
            'brand_id' => 'required|integer|exists:brands,id',
            'price' => 'required|numeric|min:0',
            'price_type' => 'required|in:physical,digital',

            'sizes' => 'required|array|min:1',
            'sizes.*' => 'required|string',

            'materials' => 'required|array|min:1',
            'materials.*' => 'required|string',

            'colors' => 'required|array|min:1',
            'colors.*' => 'required|integer|exists:colors,id',

            'categories_id' => 'required|integer|exists:categories,id',

            'image' => 'required|file|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $brand = Brand::findOrFail($request->brand_id);
        $category = Category::findOrFail($request->categories_id);

        // ✅ Create base slug
        $rawSlug = $brand->slug_short.$category->slug_short;
        $originalSlug = Str::slug($rawSlug);
        $slug = $originalSlug;
        $count = 1;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$count;
            $count++;
        }

        // ✅ Auto-generate unique SKU
        // Format: ANB-BRN-CAT-0001
        $basePrefix = 'ANB';
        $baseSku = strtoupper(substr($brand->slug_short, 0, 3)).strtoupper(substr($category->slug_short, 0, 3));
        $prefix = $basePrefix.'-'.$baseSku.'-';

        $lastProduct = Product::where('sku', 'like', $prefix.'%')
            ->orderBy('sku', 'desc')
            ->first();

        if ($lastProduct) {
            $lastNumber = (int) substr($lastProduct->sku, -4);
            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '0001';
        }

        $sku = $prefix.$nextNumber;

        // Filter Arrays
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
            'sku' => $sku, // ✅ Auto-generated SKU
            'slug' => $slug,
            'image' => $product_image,
            'type' => $validated['type'],
            'user_id' => auth()->id(),
            'sizes' => json_encode(array_values($validated['sizes'])),
            'materials' => json_encode(array_values($validated['materials'])),
            'categories_id' => $validated['categories_id'],
            'price' => $validated['price'],
            'price_type' => $validated['price_type'],
            'brand_id' => $validated['brand_id'],
        ]);

        // Attach product colors
        foreach ($validated['colors'] as $colorId) {
            ProductColors::create([
                'product_id' => $product->id,
                'color_id' => $colorId,
            ]);
        }

        return redirect()->route('product.index')
            ->with('success', 'Product created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $sku)
    {
        $product = Product::where('sku', $sku)->with('productColors.color', 'template')->first();
        if ($product) {

            return Inertia::render('home/product/show', [
                'product' => $product,
                'page_type' => 'home',
            ]);
        } else {
            abort(404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $sku)
    {
        $product = Product::where('sku', $sku)->where('store_id', null)->with('productColors.color')->first();
        if ($product) {
            $categories = Category::all();
            $colors = Color::all();
            $brands = Brand::all();

            return Inertia::render('super-admin/product/edit', [
                'catogories' => $categories,
                'colors' => $colors,
                'product' => $product,
                'brands' => $brands,
            ]);
        } else {
            abort(404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'price_type' => 'required|in:physical,digital',
            'brand_id' => 'required|integer|exists:brands,id',
            'categories_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'type' => 'nullable|string',
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
            $filename = time().'-'.$file->getClientOriginalName();
            $product_image = $file->storeAs('product', $filename, 'public');

            $product->image = $product_image;
        }

        $brand = Brand::findOrFail($validated['brand_id']);
        $category = Category::findOrFail($validated['categories_id']);

        // ✅ Only regenerate slug if brand/category changed
        if ($product->brand_id !== $validated['brand_id'] || $product->categories_id !== $validated['categories_id']) {
            $rawSlug = $brand->slug_short.$category->slug_short;
            $originalSlug = Str::slug($rawSlug);
            $slug = $originalSlug;
            $count = 1;

            while (Product::where('slug', $slug)
                ->where('id', '!=', $product->id)
                ->exists()) {

                $slug = $originalSlug.'-'.$count;
                $count++;
            }

            $product->slug = 'ANB-'.$slug;
        }

        // ✅ Only regenerate SKU if brand/category changed
        if ($product->brand_id !== $validated['brand_id'] || $product->categories_id !== $validated['categories_id']) {

            $basePrefix = 'ANB';
            $baseSku = strtoupper(substr($brand->slug_short, 0, 3)).strtoupper(substr($category->slug_short, 0, 3));
            $prefix = $basePrefix.'-'.$baseSku.'-';

            $lastProduct = Product::where('sku', 'like', $prefix.'%')
                ->orderBy('sku', 'desc')
                ->first();

            if ($lastProduct) {
                $lastNumber = (int) substr($lastProduct->sku, -4);
                $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $nextNumber = '0001';
            }

            $product->sku = $prefix.$nextNumber;
        }

        // Update product fields
        $product->title = $validated['title'];
        $product->price = $validated['price'];
        $product->brand_id = $validated['brand_id'];
        $product->type = $validated['type'];
        $product->categories_id = $validated['categories_id'];
        $product->sizes = $validated['sizes'];
        $product->materials = $validated['materials'];
        $product->save();

        // Sync product colors
        // Remove old colors
        ProductColors::where('product_id', $product->id)->delete();

        // Add new colors
        if (! empty($validated['colors'])) {
            foreach (array_filter($validated['colors']) as $colorId) {
                ProductColors::create([
                    'product_id' => $product->id,
                    'color_id' => $colorId,
                ]);
            }
        }

        return redirect()->route('product.index')->with('success', 'Product updated successfully!');
    }

    /**
     * Add Template to the specified resource in storage.
     */
    public function template(string $slug)
    {
        $product = Product::where('slug', $slug)->with('productColors.color')->first();
        if ($product) {

            return Inertia::render('super-admin/product/add-template', [
                'product' => $product,
            ]);
        } else {
            abort(404);
        }
    }

    public function storeTemplate(Request $request, string $id)
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

        return redirect()->route('product.index')->with('success', 'Product SVG template added successfully!');
    }

    public function editTemplate(string $id)
    {
        $template = SvgTemplate::where('id', $id)->with('part')->first();
        if ($template) {

            return Inertia::render('super-admin/product/edit-template', [
                'template' => $template,
            ]);
        } else {
            abort(404);
        }
    }

    public function updateTemplate(Request $request, string $id)
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

        SvgTemplatePart::where('template_id', $template->id)->delete();

        foreach ($validated['parts'] as $part) {
            SvgTemplatePart::create([
                'template_id' => $template->id,
                'part_id' => $part['part_id'],
                'type' => $part['type'],
                'name' => $part['name'],
                'color' => $part['color'],
                'is_group' => $part['is_group'],
            ]);
        }

        return redirect()->route('product.index')->with('success', 'Product SVG template updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
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

        return redirect()->route('product.index')
            ->with('success', 'Product deleted successfully!');
    }

    public function createOwnProduct(string $categoryId)
    {

        try {
            $create_own_product = CreateYourOwnProduct::where('category_id', $categoryId)->first();
            // dd($create_own_product);
            if ($create_own_product->template) {
                $svgContent = Storage::disk('public')->get($create_own_product->template);
                $storePermissions = Plan::with('permissions', 'fonts')->where('id', 1)->first();
                $logoGallery = LogoCategory::with('logos')->get();
                $parts = PartsCategory::where('own_product_id', $create_own_product->id)->with('parts')->get();

                return Inertia::render('home/product/create-your-product', [
                    'template' => $svgContent,
                    'logoGallery' => $logoGallery,
                    'permissions' => $storePermissions,
                    'parts' => $parts,
                ]);
            } else {
                return abort(404);
            }
        } catch (Exception $e) {
            return abort(404);
        }
    }
}
