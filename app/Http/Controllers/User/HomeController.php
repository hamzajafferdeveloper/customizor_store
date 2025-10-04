<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\LogoCategory;
use App\Models\Plan;
use App\Models\Product;
use App\Models\SvgTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function docs()
    {
        return Inertia::render('home/docs');
    }

    public function pricing()
    {
        $plans = Plan::where('price', '>', 0)
            ->orderBy('price', 'asc')
            ->get();
        return Inertia::render('home/pricing', [
            'plans' => $plans,
            'title' => 'Choose Your Plan',
            'description' => 'Simple, transparent pricing. Upgrade anytime. Cancel whenever you want.',
            'buttonText' => 'All plans include 24/7 support and a 14-day money-back guarantee.',
            'currency' => '$',
        ]);
    }

    public function customizer(string $id)
    {
        $template = SvgTemplate::with('part')->findOrFail($id);
        $storePermissions = Plan::with('permissions', 'fonts')->where('id', 1)->first();
        $product = $template->load('product');
        $logoGallery = LogoCategory::with('logos')->get();

        if (auth()->user() && auth()->user()->type === 'admin') {
            return Inertia::render('home/product/customizer', [
                'template' => $template,
                'logoGallery' => $logoGallery,
                'permissions' => $storePermissions,
            ]);
        } else {
            if ($product->product->type != 'simple') {
                return abort(403, 'Unathorized Access');
            } else {
                return Inertia::render('home/product/customizer', [
                    'template' => $template,
                    'logoGallery' => $logoGallery,
                    'permissions' => $storePermissions,
                ]);

            }
        }



    }

    public function categoryForRelatedProducts(){
        $categories = Category::select('id', 'name')->get();

        return response()->json([
            'categories' => $categories
        ], 200);
    }

    public function productForRelatedProducts(Request $request)
    {
        $category = $request->input('category');

        $products = Product::where('categories_id', $category)
            ->latest() // same as orderBy('created_at', 'desc')
            ->take(10)
            ->get();

            return response()->json([
                'products' => $products
            ], 200);
    }
}
