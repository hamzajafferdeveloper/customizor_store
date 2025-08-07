<?php

use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\StoreController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/user={id}/store/all', [StoreController::class, 'allStoreofUser']);

Route::prefix('/{storeId}')->name('store.')->middleware('isStorePublic')->group(function () {
    
    Route::get('/products', [HomeController::class, 'products'])->name('products');
    Route::get('/product/{slug}', [HomeController::class, 'showProduct'])->name('product.show');
    Route::middleware('isStoreAdmin')->group(function () {
        Route::get('/dashboard', [StoreController::class, 'profile'])->name('dashboard');
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
    });
    Route::get('/product/{id}/customize', [HomeController::class, 'customizeProduct'])->name('product.customizer');
});