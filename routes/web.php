<?php

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
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/super-admin.php';
require __DIR__ . '/store.php';
