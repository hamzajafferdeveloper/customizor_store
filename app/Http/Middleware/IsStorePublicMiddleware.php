<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsStorePublicMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $storeId = $request->route('storeId');
        $store = Store::findOrFail($storeId);
        $user = auth()->user();
        if ($store && $store->type === 'protected') {
            if($user && $store->user_id === $user->id){
                return $next($request);
            }
            return abort(403, 'Unathorized Access');
        } 
        return $next($request);
    }
}
