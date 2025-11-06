<?php

use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\StoreController;
use App\Http\Controllers\Store\StoreUserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/user={id}/store/all', [StoreController::class, 'allStoreofUser']);

Route::prefix('/{storeId}')->name('store.')->middleware(['auth'])->group(function () {
    Route::get('/access/store/password', function (string $storeId) {
        $store = \App\Models\Store::findOrFail($storeId);

        return Inertia::render('store/access-store-password', ['store' => $store]);
    })->name('access.password');

    Route::post('/user/login', [StoreController::class, 'loginToStore'])->name('user.login');
});

Route::prefix('/{storeId}')->name('store.')->middleware(['isStorePublic', 'isStoreActive'])->group(function () {

    Route::get('/products', [HomeController::class, 'products'])->name('products');
    Route::get('/product/{sku}', [HomeController::class, 'showProduct'])->name('product.show');
    Route::post('/password/update', [StoreController::class, 'updateStorePassword'])->name('password.update');
    Route::get('/permissions', [StoreController::class, 'permissions'])->name('permissions');

    Route::middleware('isStoreAdmin')->group(function () {
        Route::get('/dashboard', [StoreController::class, 'dashboard'])->name('dashboard');
        Route::get('/profile', [StoreController::class, 'profile'])->name('dashboard');

        Route::prefix('/order')->name('order.')->group(function () {
            Route::get('/show/{id}', [StoreController::class, 'singleOrder'])->name('show');
            Route::post('/{id}/update-status', [StoreController::class, 'changeOrderStatus'])->name('change.status');
        });

        Route::get('/create/product', [HomeController::class, 'createProduct'])->name('product.create');
        Route::post('/store/product', [HomeController::class, 'storeProduct'])->name('product.store');
        Route::get('/edit/product/{sku}', [HomeController::class, 'editProduct'])->name('product.edit');
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

        Route::get('/all/users', [StoreUserController::class, 'AllUsers'])->name('users');
        Route::get('/users', [StoreUserController::class, 'storeUsers'])->name('users');
        Route::post('/add/user/{userId}', [StoreUserController::class, 'addUserToStore'])->name('add.user');
        Route::delete('/remove/user/{userId}', [StoreUserController::class, 'removeUserFromStore'])->name('remove.user');

        Route::post('/request-extra-permission/{permission_id}', [StoreController::class, 'requestExtraPermission'])->name('request.extra.permission');

    });
    Route::get('/product/{id}/customize', [HomeController::class, 'customizeProduct'])->name('product.customizer');
});
