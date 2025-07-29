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
            return abort(403, 'Unauthorized Access');
        }

        // Fetch all stores for this user
        $stores = Store::where('user_id', $user->id)->pluck('id'); // only IDs for performance

        // ✅ Check if $storeId exists in user's stores
        if (!$stores->contains($storeId)) {
            return abort(403, 'Unauthorized Access');
        }

        return $next($request);
    }
}
