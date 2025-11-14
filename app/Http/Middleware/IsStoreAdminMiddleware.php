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
        $storeSlug = $request->route('storeSlug');
        $storeId = Store::where('slug', $storeSlug)->first()->id;
        $user = auth()->user();

        if($user && $user->type == 'admin'){
            return $next($request);
        }

        if (!$user) {
            return abort(403, 'Unauthorized Access');
        }

        // Fetch all stores for this user
        $stores = Store::where('user_id', $user->id)->pluck('id');

        // ✅ Check if $storeId exists in user's stores
        if (!$stores->contains($storeId)) {
            return abort(403, 'Unauthorized Access');
        }

        return $next($request);
    }
}
