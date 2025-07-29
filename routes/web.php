<?php

use App\Http\Controllers\home\PaymentController;
use App\Http\Controllers\home\StoreController;
use App\Http\Controllers\SuperAdmin\ProductController;
use App\Http\Controllers\User\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/docs', [HomeController::class, 'docs'])->name('documentation');
Route::get('/pricing', [HomeController::class, 'pricing'])->name('pricing');
Route::get('/product/customizer/template={id}', [HomeController::class, 'customizer'])->name('customizer');
Route::get('/product', [ProductController::class, 'index'])->name('product.index');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');

Route::middleware(['auth', 'verified'])->group(function () {
    // Payment Routes
    Route::get('/checkout/plan-id={planId}', [PaymentController::class, 'showPaymentForm'])->name('checkout.form');
    Route::post('/payment-intent', [PaymentController::class, 'createIntent'])->name('payment.intent');
    Route::post('/confirmation', [PaymentController::class, 'confirmation'])->name('payment.confirmation');

    // Store Routes
    Route::get('/create/store', [StoreController::class, 'create'])->name('store.create');
    Route::post('/store/store', [StoreController::class, 'store'])->name('store.store');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/super-admin.php';
require __DIR__ . '/store.php';
