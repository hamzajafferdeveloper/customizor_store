<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\LogoCategory;
use App\Models\Permission;
use App\Models\Plan;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\SoldProduct;
use App\Models\Store;
use App\Models\StoreStripeKey;
use App\Models\SvgTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;
use Stripe\Checkout\Session;
use Stripe\Stripe;

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

    public function categoryForRelatedProducts()
    {
        $categories = Category::select('id', 'name')->get();

        return response()->json([
            'categories' => $categories,
        ], 200);
    }

    public function productForRelatedProducts(Request $request)
    {
        $category = $request->input('category');
        if($request->input('store_id')){

            $store_id = $request->input('store_id');
            $store = Store::with('banner')->findOrFail($store_id);

            $plan = $store->load('plan.permissions');
            $permissions = $plan->plan->permissions->pluck('key')->toArray();

            $allPermissions = Permission::pluck('key')->toArray();

            $availablePermission = collect($allPermissions)
                ->filter(fn ($p) => str_ends_with($p, '_product'))
                ->values()
                ->all();

            // Map permissions to product types
            $allowedTypes = array_values(array_intersect($availablePermission, $permissions));

            $productTypeIds = ProductType::whereIn('name', str_replace('_product', '', $allowedTypes))
            ->pluck('id');

            $products = Product::where('categories_id', $category)
                ->whereIn('product_type_id', $productTypeIds)
                ->orWhere('store_id', $store->id)
                ->latest()
                ->take(10)
                ->get();
        } else {
            $products = Product::where('categories_id', $category)
            ->latest()
            ->take(10)
            ->get();
        }

        return response()->json([
            'products' => $products,
        ], 200);
    }

    public function buyedProducts()
    {
        try {
            $user = auth()->user();

            $buyedProducts = SoldProduct::where('user_id', $user->id)->with('product')->get();

            return response()->json([
                'buyedProducts' => $buyedProducts,
            ], 200);

        } catch (\Throwable $th) {
            Log::error($th->getMessage());
        }
    }

    public function buyProduct(Request $request)
    {
        $product = Product::findOrFail($request->input('product_id'));

        // Default Stripe key
        $stripeSecret = config('services.stripe.secret');

        // Check for store-specific Stripe keys
        if ($product->store_id) {
            $stripeKeys = StoreStripeKey::where('store_id', $product->store_id)->first();
            if ($stripeKeys && $stripeKeys->stripe_secret_key) {
                $stripeSecret = $stripeKeys->stripe_secret_key;
            }
        }

        // Ensure we have a valid Stripe secret key
        if (! $stripeSecret) {
            return response()->json([
                'error' => 'Stripe secret key not configured for this store.',
            ], 500);
        }

        // Set Stripe API key
        Stripe::setApiKey($stripeSecret);

        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => ['name' => $product->title],
                        'unit_amount' => (int) ($product->price * 100),
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => url('/payment/success?session_id={CHECKOUT_SESSION_ID}'),
                'cancel_url' => url('/payment/cancel'),
            ]);

            // ✅ Return JSON instead of redirect to avoid CORS issues
            return response()->json(['url' => $session->url]);

        } catch (\Exception $e) {
            // Handle Stripe API errors gracefully
            return response()->json([
                'error' => 'Stripe error: '.$e->getMessage(),
            ], 500);
        }
    }

    public function paymentSuccess(Request $request)
    {
        $sessionId = $request->get('session_id');

        if (! $sessionId) {
            abort(404, 'Missing session');
        }

        Stripe::setApiKey(config('services.stripe.secret'));
        $session = Session::retrieve($sessionId);

        if ($session->payment_status !== 'paid') {
            abort(403, 'Payment not verified.');
        }

        $lineItems = Session::allLineItems($sessionId);

        // Get product & user data (you can use metadata if needed)
        $user = auth()->user();
        $product = Product::where('title', $lineItems->data[0]->description ?? '')->first();

        // ✅ Now safely create the record
        SoldProduct::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ], [
            'price' => $product->price,
        ]);

        // Render your Inertia view
        $template = SvgTemplate::with('part')->where('product_id', $product->id)->first();
        $storePermissions = Plan::with('permissions', 'fonts')->where('id', 1)->first();
        $logoGallery = LogoCategory::with('logos')->get();

        return Inertia::render('home/product/customizer', [
            'template' => $template,
            'logoGallery' => $logoGallery,
            'permissions' => $storePermissions,
        ]);
    }

    public function buyProductPage(Request $request)
    {
        $selectedType = $request->query('product_type', 'digital'); // default to digital

        $user = auth()->user();

        if ($selectedType === 'physical') {
            $products = \App\Models\SoldPhysicalProduct::where('user_id', $user->id)
                ->with('product')
                ->get();
        } else {
            $products = SoldProduct::where('user_id', $user->id)
                ->with('product')
                ->get();
        }

        return Inertia::render('home/buy-product', [
            'products' => $products,
            'selectedUrlType' => $selectedType, // frontend can use this for tab highlight
        ]);
    }
}
