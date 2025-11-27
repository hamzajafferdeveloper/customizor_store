<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class IsStoreActiveMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $storeSlug = $request->route('storeSlug');

        // If slug is missing → 404
        if (!$storeSlug) {
            abort(404, 'Store not found.');
        }

        // Find store
        $store = Store::where('slug', $storeSlug)->first();

        // If no store found → 404
        if (!$store) {
            throw new NotFoundHttpException();
        }

        $user = auth()->user();

        /**
         * Rules:
         * - If guest AND store inactive → block
         * - If logged-in user BUT not owner AND store inactive → block
         */
        if ($store->status === 'inactive') {
            if (!$user || $user->id !== $store->user_id) {
                abort(403, 'This store is not active.');
            }
        }

        return $next($request);
    }
}
