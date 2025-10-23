<?php

use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\CreateStoreController;
use App\Http\Controllers\SuperAdmin\BrandController;
use App\Http\Controllers\SuperAdmin\CategoryController;
use App\Http\Controllers\SuperAdmin\ColorController;
use App\Http\Controllers\SuperAdmin\CreateYourOwnProduct;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\FontController;
use App\Http\Controllers\SuperAdmin\LogoGalleryController;
use App\Http\Controllers\SuperAdmin\PartController;
use App\Http\Controllers\SuperAdmin\PlansController;
use App\Http\Controllers\SuperAdmin\ProductController;
use Illuminate\Support\Facades\Route;

// Route Only for Super Admin
Route::middleware(['auth', 'verified', 'isAdmin'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Route For Store
    Route::get('/admin/plans', [PlansController::class, 'index'])->name('superadmin.plans.index');
    Route::post('/admin/plans/store', [PlansController::class, 'store'])->name('superadmin.plan.store');
    Route::put('/admin/plans/update/{id}', [PlansController::class, 'update'])->name('superadmin.plan.update');
    Route::delete('/admin/plans/{id}', [PlansController::class, 'destroy'])->name('superadmin.plan.destroy');
    Route::post('/plans/{plan}/update-permissions', [PlansController::class, 'updatePermissions'])->name('plans.updatePermissions');

    // Route For Category
    Route::prefix('/category')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('category.index');
        Route::post('/store', [CategoryController::class, 'store'])->name('superadmin.category.store');
        Route::put('/{id}', [CategoryController::class, 'update'])->name('superadmin.category.update');
        Route::delete('/{id}', [CategoryController::class, 'destroy'])->name('superadmin.category.destroy');
    });

    Route::prefix('/brand')->group(function () {
        Route::get('/', [BrandController::class, 'index'])->name('brand.index');
        Route::post('/store', [BrandController::class, 'store'])->name('superadmin.brand.store');
        Route::put('/{id}', [BrandController::class, 'update'])->name('superadmin.brand.update');
        Route::delete('/{id}', [BrandController::class, 'destroy'])->name('superadmin.brand.destroy');
    });

    // Route For Color
    Route::prefix('/color')->group(function () {
        Route::get('/', [ColorController::class, 'index'])->name('color.index');
        Route::post('/store', [ColorController::class, 'store'])->name('superadmin.color.store');
        Route::put('/{id}', [ColorController::class, 'update'])->name('superadmin.color.update');
        Route::delete('/{id}', [ColorController::class, 'destroy'])->name('superadmin.color.destroy');
        Route::put('/update-color/{id}', [ColorController::class, 'updateColor'])->name('superadmin.color.updateColorType');
    });

    Route::get('/product-create', [ProductController::class, 'create'])->name('superadmin.product.create');

    // Route For Logo Gallery
    Route::prefix('/logo-gallery')->group(function () {
        // Route for Logo Gallery Category
        Route::get('/category', [LogoGalleryController::class, 'category'])->name('superadmin.logo.gallery.category');
        Route::post('/create-logo-category', [LogoGalleryController::class, 'storeCategory'])->name('superadmin.logo.gallery.category.create');
        Route::put('/update-logo-category/{categoryId}', [LogoGalleryController::class, 'updateCategory'])->name('superadmin.logo.gallery.category.update');
        Route::delete('/delete-logo-category/{categoryId}', [LogoGalleryController::class, 'deleteCategory'])->name('superadmin.logo.gallery.category.delete');

        // Route for Logo Gallery Logos
        Route::get('/category={id}', [LogoGalleryController::class, 'logo'])->name('superadmin.logo.gallery');
        Route::post('/create-logo', [LogoGalleryController::class, 'storeLogo'])->name('superadmin.logo.gallery.create');
        Route::delete('/delete-logo/{logoId}', [LogoGalleryController::class, 'deleteLogo'])->name('superadmin.logo.gallery.delete');
    });

    // Route For Product
    Route::prefix('/product')->group(function () {
        Route::post('/store', [ProductController::class, 'store'])->name('superadmin.product.store');
        Route::get('/edit/{slug}', [ProductController::class, 'edit'])->name('superadmin.product.edit');
        Route::post('/{id}', [ProductController::class, 'update'])->name('superadmin.product.update');
        Route::delete('/{id}', [ProductController::class, 'destroy'])->name('superadmin.product.destroy');
        Route::get('/add/template/product-slug={slug}', [ProductController::class, 'template'])->name('superadmin.product.add.template');
        Route::post('/store/template/product-id={id}', [ProductController::class, 'storeTemplate'])->name('superadmin.product.store.template');
        Route::get('/edit/template/template-id={id}', [ProductController::class, 'editTemplate'])->name('superadmin.product.edit.template');
        Route::put('/update/template/template-id={id}', [ProductController::class, 'updateTemplate'])->name('superadmin.product.update.template');
    });

    Route::prefix('/font')->group(function () {
        Route::get('/', [FontController::class, 'index'])->name('superadmin.fonts.index');
        Route::post('/store', [FontController::class, 'store'])->name('superadmin.fonts.store');
        Route::post('/{id}/update', [FontController::class, 'update'])->name('superadmin.fonts.update');
        Route::delete('/{id}/destroy', [FontController::class, 'destroy'])->name('superadmin.fonts.destroy');
        Route::post('/fonts/{font}/assign-plans', [FontController::class, 'assignPlans'])->name('superadmin.fonts.assignPlans');
    });

    Route::prefix('/parts')->group(function () {
        // Route for Parts Categories
        Route::get('/categories', [PartController::class, 'categories'])->name('superadmin.parts.categories');
        Route::post('/category', [PartController::class, 'createCategory'])->name('superadmin.parts.create.category');
        Route::put('/category/{id}', [PartController::class, 'editCategory'])->name('superadmin.parts.edit.category');
        Route::delete('/category/{id}', [PartController::class, 'destroyCategory'])->name('superadmin.parts.delete.category');
        // Route for Parts
        Route::get('/category={id}', [PartController::class, 'parts'])->name('superadmin.parts.index');
        Route::post('/create/categroy={id}', [PartController::class, 'createParts'])->name('superadmin.parts.create');
        Route::delete('/delete/categroy={id}', [PartController::class, 'destroyPart'])->name('superadmin.parts.destroy');
    });

    Route::prefix('/create-your-own-product')->name('superadmin.create-your-own-product.')->group(function () {
        Route::get('/index', [CreateYourOwnProduct::class, 'index'])->name('index');
        Route::post('/store', [CreateYourOwnProduct::class, 'store'])->name('store');
        Route::post('/update/{id}', [CreateYourOwnProduct::class, 'update'])->name('update');
        Route::delete('/destroy/{id}', [CreateYourOwnProduct::class, 'destroy'])->name('destroy');
    });

    Route::prefix('/create-store')->name('superadmin.create-store.')->group(function () {
        Route::get('/add', [CreateStoreController::class, 'add'])->name('add');
        Route::post('/store', [CreateStoreController::class, 'store'])->name('store');
    });

    Route::prefix('/order')->name('superadmin.order.')->group(function () {
        Route::get('/index', [AdminOrderController::class, 'index'])->name('index');
        Route::get('/show/{id}', [AdminOrderController::class, 'show'])->name('show');
    });
});
