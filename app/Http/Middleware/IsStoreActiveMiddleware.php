<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsStoreActiveMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $storeId = $request->route('storeId');

        $store = Store::findOrFail($storeId);

        // dd($store->status);

        $user = auth()->user();

        if ($user->id != $store->user_id && $store->status == 'inactive') {
            return abort(403, 'Store is not active');
        }

        return $next($request);
    }
}
