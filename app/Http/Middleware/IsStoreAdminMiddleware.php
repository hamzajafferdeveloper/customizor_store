<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsStoreAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $storeId = $request->route('storeId');
        $user = auth()->user();
        if (!$user) {
            return abort(403, 'UnAthorized Access');
        } else {
            $store = Store::where('user_id', $user->id)->first();
            if (!$store || $store && $store->id != $storeId ) {
                return abort(403, 'UnAthorized Access');
            }
            return $next($request);
        }
    }
}
