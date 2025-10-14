<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\LogoCategory;
use App\Models\Plan;
use App\Models\Product;
use App\Models\SoldProduct;
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

        $products = Product::where('categories_id', $category)
            ->latest() // same as orderBy('created_at', 'desc')
            ->take(10)
            ->get();

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

    Stripe::setApiKey(config('services.stripe.secret'));

    $session = Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price_data' => [
                'currency' => 'usd',
                'product_data' => ['name' => $product->title],
                'unit_amount' => $product->price * 100,
            ],
            'quantity' => 1,
        ]],
        'mode' => 'payment',
        'success_url' => url('/payment/success?session_id={CHECKOUT_SESSION_ID}'),
        'cancel_url' => url('/payment/cancel'),
    ]);

    return response()->json(['url' => $session->url]);
}


    public function paymentSuccess(Request $request)
{
    $sessionId = $request->get('session_id');

    if (!$sessionId) {
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
}
