<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use App\Mail\OrderConfirmedAdminMail;
use App\Mail\OrderConfirmedMail;
use App\Models\Product;
use App\Models\SoldPhysicalProduct;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class BuyPhysicalProduct extends Controller
{
    public function buyProduct(Request $request)
    {
        try {
            // ✅ Validate input
            $validated = $request->validate([
                'name' => 'required|string',
                'email' => 'required|email',
                'number' => 'required|string',
                'address' => 'required|string',
                'country' => 'required|string',
                'product_id' => 'required|exists:products,id',
                'has_delivery_address' => 'required|boolean',
                'delivery_address' => 'nullable|string',
                'file' => 'nullable',
            ]);

            // ✅ Get product
            $product = Product::findOrFail($validated['product_id']);

            $filePath = null;
            if ($request->filled('file')) {
                // Create a unique file name
                $fileName = 'order_'.time().'.svg';
                $fileContent = $request->input('file');

                // Save the SVG content as a file inside storage/app/public/physical-product-orders/
                Storage::disk('public')->put("physical-product-orders/{$fileName}", $fileContent);

                $filePath = "physical-product-orders/{$fileName}";
            }

            // ✅ Create order (Pending until payment success)
            $order = SoldPhysicalProduct::create([
                'product_id' => $product->id,
                'store_id' => $product->store_id,
                'user_id' => auth()->id(),
                'name' => $validated['name'],
                'email' => $validated['email'],
                'number' => $validated['number'],
                'address' => $validated['address'],
                'country' => $validated['country'],
                'has_delivery_address' => $validated['has_delivery_address'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'payment_status' => 'pending',
                'price' => $product->price,
                'file' => $filePath,
            ]);

            // ✅ Initialize Stripe
            Stripe::setApiKey(config('services.stripe.secret'));

            // ✅ Create checkout session
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => ['name' => $product->title],
                        'unit_amount' => $product->price * 100,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => url("/buy-physical-product/success?session_id={CHECKOUT_SESSION_ID}&order_id={$order->id}"),
                'cancel_url' => url('/buy-physical-product/cancel'),
            ]);

            return Inertia::location($session->url);
        } catch (Exception $e) {
            Log::error('Stripe Error: '.$e->getMessage());

            return back()->with('error', 'Something went wrong while processing payment.');
        }
    }

    public function paymentSuccess(Request $request)
    {
        try {
            $sessionId = $request->get('session_id');
            $orderId = $request->get('order_id');

            if (! $sessionId || ! $orderId) {
                abort(404, 'Missing session or order reference.');
            }

            Stripe::setApiKey(config('services.stripe.secret'));
            $session = Session::retrieve($sessionId);

            if ($session->payment_status !== 'paid') {
                abort(403, 'Payment not verified.');
            }

            // ✅ Get order
            $order = SoldPhysicalProduct::findOrFail($orderId);

            // ✅ Only process if not already paid
            if ($order->payment_status === 'pending') {
                // ✅ Mark order as paid
                $order->payment_status = 'paid';
                $order->save();

                $pro = Product::find($order->product_id);
                $admin = User::findOrFail($pro->user_id);

                Mail::to($order->email)->send(new OrderConfirmedMail($order));
                Mail::to($admin->email)->send(new OrderConfirmedAdminMail($order, $admin));
            }

            // return redirect()->route('user.orders')->with('success', 'Payment successful! Your order has been confirmed.');
        } catch (Exception $e) {
            Log::error('Payment Success Error: '.$e->getMessage());

            return back()->with('error', 'Payment verification failed.');
        }
    }
}
