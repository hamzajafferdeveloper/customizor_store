<?php

use App\Http\Controllers\Home\BuyPhysicalProductController;
use App\Http\Controllers\home\PaymentController;
use App\Http\Controllers\home\StoreController;
use App\Http\Controllers\SuperAdmin\ProductController;
use App\Http\Controllers\User\HomeController;
use App\Models\Color;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/checkout/mail', function() {
    return view('mails.payment.checkout');
});
Route::get('/renew/mail', function() {
    return view('mails.payment.renew');
});
Route::get('/upgrade/mail', function() {
    return view('mails.payment.upgrade');
});


Route::get('/category-for-related-products', [HomeController::class, 'categoryForRelatedProducts'])->name('category.for.related.product');
Route::get('/product-for-related-products', [HomeController::class, 'productForRelatedProducts'])->name('product.for.related.product');

Route::get('/docs', [HomeController::class, 'docs'])->name('documentation');
Route::get('/pricing', [HomeController::class, 'pricing'])->name('pricing');
Route::get('/product/customizer/template={id}', [HomeController::class, 'customizer'])->name('customizer');
Route::get('/product', [ProductController::class, 'index'])->name('product.index');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');
Route::get('/design-our-own-product', [ProductController::class, 'createOwnProduct'])->name('design.product');

Route::get('/all/colors', function (){
    $colors = Color::all();
    if($colors){
        return response()->json([
            'colors' => $colors
        ], 200);
    }
    return response()->json(['message', 'No Color Found'], 404);
});

Route::get('product-price-type/{id}', function ($id) {
    $product = \App\Models\Product::find($id);
    if($product){
        return response()->json([
            'productPriceType' => $product->price_type
        ], 200);
    }
    return response()->json(['message', 'No Product Found'], 404);
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Payment Routes
    Route::get('/checkout/plan-id={planId}', [PaymentController::class, 'showPaymentForm'])->name('checkout.form');
    Route::get('/upgrade/store-id={storeId}', [PaymentController::class, 'showUpgradeForm'])->name('upgrade.form');
    Route::get('/renew/store-id={storeId}', [PaymentController::class, 'showRenewForm'])->name('renew.form');

    Route::post('/payment-intent', [PaymentController::class, 'createIntent'])->name('payment.intent');
    Route::post('/confirmation', [PaymentController::class, 'confirmation'])->name('payment.confirmation');
    Route::post('/upgrade/confirm', [PaymentController::class, 'upgradeConfirmation']);
    Route::post('/renew/confirm', [PaymentController::class, 'renewConfirmation']);

    // Store Routes
    Route::get('/create/store', [StoreController::class, 'create'])->name('store.create');
    Route::post('/store/store', [StoreController::class, 'store'])->name('store.store');

    // Get Currently Logged In users buyed products
    Route::get('/buyed-products', [HomeController::class, 'buyedProducts'])->name('buyed.products');

    // Buy Product
    Route::get('/buy-products', [HomeController::class, 'buyProductPage'])->name('buy.product.page');

    Route::post('/buy-product', [HomeController::class, 'buyProduct'])->name('buy.product');
    Route::get('/payment/success', [HomeController::class, 'paymentSuccess'])->name('buy.product');


    Route::post('/buy-physical-product', [BuyPhysicalProductController::class, 'buyProduct'])->name('buy.physical.product');
    Route::get('/buy-physical-product/success', [BuyPhysicalProductController::class, 'paymentSuccess'])->name('buy.physical.product.success');
    Route::get('/buy-physical-product/cancel', [BuyPhysicalProductController::class, 'paymentCancel'])->name('buy.physical.product.cancel');

    Route::get('/buy-physical-product/{id}', [BuyPhysicalProductController::class, 'show'])->name('buy.physical.product.show');

});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/super-admin.php';
require __DIR__ . '/store.php';
