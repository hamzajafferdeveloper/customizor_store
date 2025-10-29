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

        // dd($store->load('plan'), $store->load('paymentDetail'));

        $user = auth()->user();
        if ($store && $store->type === 'protected') {
            // If the store is protected, check if the user is the owner
            if($user && $store->user_id === $user->id){
                return $next($request);
            }

            if (session('store_logged_in') === $store->id) {
                return $next($request);
            }

            // If the user is not the owner, return to password access page
            return redirect()->route('store.access.password', ['storeId' => $storeId]);

        }
        return $next($request);
    }
}
