<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class isValidStoreSlugMiddlware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $storeSlug = $request->route('storeSlug');

        $store = Store::where('slug', $storeSlug)->first();

        if (!$store) {
            // Throws an exception that Handler.php can catch
            throw new NotFoundHttpException();
        }

        // Optional: attach store to request
        $request->attributes->set('store', $store);

        return $next($request);
    }
}
