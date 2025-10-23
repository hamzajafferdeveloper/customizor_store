<?php

use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\StoreController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/user={id}/store/all', [StoreController::class, 'allStoreofUser']);

Route::prefix('/{storeId}')->name('store.')->middleware(['isStorePublic', 'isStoreActive'])->group(function () {

    Route::get('/products', [HomeController::class, 'products'])->name('products');
    Route::get('/product/{slug}', [HomeController::class, 'showProduct'])->name('product.show');
    Route::middleware('isStoreAdmin')->group(function () {
        Route::get('/dashboard', [StoreController::class, 'dashboard'])->name('dashboard');
        Route::get('/profile', [StoreController::class, 'profile'])->name('dashboard');

        Route::prefix('/order')->name('order.')->group(function () {
            Route::get('/index', [StoreController::class, 'allOrders'])->name('index');
            Route::get('/show/{id}', [StoreController::class, 'singleOrder'])->name('show');
        });

        Route::get('/create/product', [HomeController::class, 'createProduct'])->name('product.create');
        Route::post('/store/product', [HomeController::class, 'storeProduct'])->name('product.store');
        Route::get('/edit/product/{slug}', [HomeController::class, 'editProduct'])->name('product.edit');
        Route::post('/update/product/{id}', [HomeController::class, 'updateProduct'])->name('product.update');
        Route::delete('/delete/product/{id}', [HomeController::class, 'destroyProduct'])->name('product.delete');
        Route::get('/product/{slug}/add-template', [HomeController::class, 'addTemplate'])->name('product.add.template');
        Route::post('/product/{slug}/store-template', [HomeController::class, 'storeTemplate'])->name('product.store.template');
        Route::get('/profile', [StoreController::class, 'profile'])->name('profile');
        Route::post('/update/profile', [StoreController::class, 'updateProfile'])->name('profile.update');
        Route::post('/store/banner', [StoreController::class, 'banner'])->name('banner');
        Route::get('/edit/template/template-id={id}', [HomeController::class, 'editTemplate'])->name('product.edit.template');
        Route::put('/update/template/template-id={id}', [HomeController::class, 'updateTemplate'])->name('product.update.template');
        Route::post('/update/stripe/update', [StoreController::class, 'updateStripe'])->name('stripe.update');
    });
    Route::get('/product/{id}/customize', [HomeController::class, 'customizeProduct'])->name('product.customizer');
});
