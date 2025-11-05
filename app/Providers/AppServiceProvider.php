<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Cache;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        $this->app->singleton('siteSettings', function () {
            return Cache::rememberForever('site_settings', function () {
                return \App\Models\Setting::pluck('value', 'key')->toArray();
            });
        });
    }
}
