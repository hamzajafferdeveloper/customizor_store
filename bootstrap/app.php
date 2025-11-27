<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\IsAdminMiddleware;
use App\Http\Middleware\IsStoreActiveMiddleware;
use App\Http\Middleware\IsStoreAdminMiddleware;
use App\Http\Middleware\IsStorePublicMiddleware;
use App\Http\Middleware\isValidStoreSlugMiddlware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'isAdmin' => IsAdminMiddleware::class,
            'isStoreAdmin' => IsStoreAdminMiddleware::class,
            'isStorePublic' => IsStorePublicMiddleware::class,
            'isStoreActive' => IsStoreActiveMiddleware::class,
            'isValidStoreSlug' => isValidStoreSlugMiddlware::class,
        ]);

    })
    ->withSchedule(function (Schedule $schedule) {
        $schedule->command('app:deactivate-expired-stores')->daily();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
