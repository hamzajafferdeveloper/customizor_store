<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        // Always show custom 404 page
        if ($exception instanceof NotFoundHttpException) {
            // Ensure it’s an HTML request
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Page not found'], 404);
            }

            // Check if view exists
            if (view()->exists('errors.404')) {
                return response()->view('errors.404', [], 404);
            }

            // Fallback plain text
            return response('Page not found', 404);
        }

        // For other exceptions, let Laravel handle normally
        return parent::render($request, $exception);
    }
}
