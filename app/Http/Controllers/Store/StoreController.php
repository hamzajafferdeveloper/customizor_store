<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Mail\RequestPermissionMail;
use App\Models\Permission;
use App\Models\Product;
use App\Models\RequestExtraPermission;
use App\Models\SoldPhysicalProduct;
use App\Models\SoldProduct;
use App\Models\Store;
use App\Models\StoreBanner;
use App\Models\StoreExtraPermission;
use App\Models\StoreStripeKey;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Mail;

class StoreController extends Controller
{
    public function dashboard(string $storeId, Request $request)
    {
        $store = Store::with('banner')->findOrFail($storeId);

        $months = collect(range(5, 0))->map(function ($i) {
            return now()->subMonths($i)->format('Y-m'); // Last 6 months
        });

        // Helper for monthly chart data
        $getMonthlyData = function ($model, $column = 'COUNT(*)') use ($months) {
            $rawData = $model::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, '.$column.' as total')
                ->where('created_at', '>=', now()->subMonths(6))
                ->groupBy('month')
                ->pluck('total', 'month');

            return $months->map(fn ($m) => $rawData[$m] ?? 0)->toArray();
        };

        $calculateGrowth = function ($data) {
            if (count($data) < 2) {
                return 0;
            }
            $last = end($data);
            $prev = $data[count($data) - 2];

            return $prev > 0 ? round((($last - $prev) / $prev) * 100, 2) : ($last > 0 ? 100 : 0);
        };

        $totalProductData = $getMonthlyData(new Product);
        $totalDigitalProductSoldData = $getMonthlyData(new SoldProduct, 'SUM(price)');
        $totalPhysicalProductSoldData = $getMonthlyData(new SoldPhysicalProduct, 'SUM(price)');
        // $totalRevenueData = $getMonthlyData(new Product());

        $totalProductChartData = Product::selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->where('created_at', '>=', now()->subMonths(3))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalDigitalProductSoldChartData = SoldProduct::selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->where('created_at', '>=', now()->subMonths(3))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Country chart data
        $totalPhysicalProductSoldChartData = SoldPhysicalProduct::selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->where('created_at', '>=', now()->subMonths(3))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalProducts = Product::where('store_id', $storeId)->count();

        $totalDigitalProductSold = SoldProduct::where('store_id', $storeId)->sum('price');
        $totalPhysicalProductSold = SoldPhysicalProduct::where('store_id', $storeId)->sum('price');

        $totalRevenue = $totalDigitalProductSold + $totalPhysicalProductSold;

        $query = SoldPhysicalProduct::where('store_id', $store->id)->with('product');
        // Search filter
        if ($request->has('search') && $request->search !== '') {
            $query->whereHas('product', function ($q) use ($request) {
                $q->where('title', 'like', '%'.$request->search.'%');
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $orders = $query->paginate($perPage)->appends($request->all());

        return Inertia::render('store/dashboard', [
            'store' => $store,
            'orders' => $orders,
            'stats' => [
                'revenue' => [
                    'total' => $totalRevenue,
                    // 'growth' => $calculateGrowth($revenueData),
                    // 'chart' => $revenueData
                ],
                'product' => [
                    'total' => $totalProducts,
                    'growth' => $calculateGrowth($totalProductData),
                    'chart' => $totalProductData,
                ],
                'digitalProductSold' => [
                    'total' => $totalDigitalProductSold,
                    'growth' => $calculateGrowth($totalDigitalProductSoldData),
                    'chart' => $totalDigitalProductSoldData,
                ],
                'physicalProductSold' => [
                    'total' => $totalPhysicalProductSold,
                    'growth' => $calculateGrowth($totalPhysicalProductSoldData),
                    'chart' => $totalPhysicalProductSoldData,
                ],
            ],
        ]);
    }

    public function singleOrder(string $storeId, string $id)
    {
        $store = Store::findOrFail($storeId);
        $order = SoldPhysicalProduct::findOrFail($id);

        return Inertia::render('store/order/show', [
            'order' => $order,
            'store' => $store,
        ]);
    }

    public function allStoreofUser(string $id)
    {
        $stores = Store::where('user_id', $id)->get();

        if ($stores) {
            return response()->json([
                'data' => $stores,
            ], 200);
        } else {
            return response()->json([
                'message' => 'No Store related to given user',
            ], 404);
        }
    }

    public function profile(string $storeId)
    {
        $store = Store::with('banner')->findOrFail($storeId);
        $stripeKey = StoreStripeKey::where('store_id', $store->id)->first();

        return Inertia::render('store/profile', [
            'store' => $store->load('plan'),
            'initialPublicKey' => $stripeKey ? $stripeKey->stripe_public_key : '',
            'initialSecretKey' => $stripeKey ? $stripeKey->stripe_secret_key : '',
        ]);
    }

    public function updateProfile(Request $request, string $storeId)
    {
        $store = Store::findOrFail($storeId);

        // Validate input dynamically
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:100',
            'bio' => 'sometimes|string|nullable',
            'type' => 'sometimes',
            'logo' => 'sometimes|file|image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB max
        ]);

        // Handle logo replacement if provided
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($store->logo && Storage::disk('public')->exists($store->logo)) {
                Storage::disk('public')->delete($store->logo);
            }

            // Store new logo
            $logoPath = $request->file('logo')->store('logos', 'public');
            $validated['logo'] = $logoPath;
        }

        // Update store data
        $store->update($validated);

        return redirect()->back();
    }

    public function banner(Request $request, string $storeId)
    {
        // Validate request
        $validated = $request->validate([
            'banner' => 'required|file|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Find existing banner for this store
        $storeBanner = StoreBanner::where('store_id', $storeId)->first();

        // Store the uploaded file in 'public/banners'
        $filePath = $request->file('banner')->store('banners', 'public');

        if ($storeBanner) {
            // If a banner exists, delete old file and update
            if ($storeBanner->banner && \Storage::disk('public')->exists($storeBanner->banner)) {
                \Storage::disk('public')->delete($storeBanner->banner);
            }

            $storeBanner->update([
                'path' => $filePath,
            ]);
        } else {
            // If no banner exists, create a new record
            StoreBanner::create([
                'store_id' => $storeId,
                'path' => $filePath,
            ]);
        }

        return redirect()->route('store.dashboard', $storeId)->with('success', 'Banner Added Or Updated Successfully');

    }

    public function updateStripe(Request $request, string $storeId)
    {
        // Validate request
        $validated = $request->validate([
            'stripe_public_key' => 'required|string|max:255',
            'stripe_secret_key' => 'required|string|max:255',
        ]);

        // Ensure the store exists
        $store = Store::findOrFail($storeId);

        // Check if Stripe keys already exist for this store
        $stripeKeys = StoreStripeKey::where('store_id', $storeId)->first();

        if ($stripeKeys) {
            // Update existing keys
            $stripeKeys->update([
                'stripe_public_key' => $validated['stripe_public_key'],
                'stripe_secret_key' => $validated['stripe_secret_key'],
            ]);
        } else {
            // Create new record
            StoreStripeKey::create([
                'store_id' => $store->id,
                'stripe_public_key' => $validated['stripe_public_key'],
                'stripe_secret_key' => $validated['stripe_secret_key'],
            ]);
        }

        // Return success response
        return back()->with('success', 'Stripe keys saved successfully.');
    }

    public function changeOrderStatus(Request $request, string $id)
    {
        try {

            $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
            ]);

            $order = SoldPhysicalProduct::findOrFail($id);
            $order->order_status = $request->status;
            $order->save();

            return redirect()->back()->with('success', 'Order status updatd successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Order not found.');
        }
    }

    public function updateStorePassword(Request $request, string $storeId)
    {
        try {
            $request->validate([
                'password' => 'required|string|min:6',
            ]);

            $store = Store::findOrFail($storeId);
            $store->password = bcrypt($request->password);
            $store->store_key = base64_encode($request->password);
            $store->save();

            return redirect()->back()->with('success', 'Store password updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Store not found.');
        }
    }

    public function loginToStore(Request $request, string $storeId)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = auth()->user();
        $store = Store::findOrFail($storeId);

        // Step 1: Check if user belongs to the store (many-to-many relation)
        $isMember = $store->users()->where('user_id', $user->id)->exists();

        if (! $isMember) {
            return redirect()->back()->withErrors([
                'password' => 'You are not authorized to access this store.',
            ]);
        }

        if (! Hash::check($request->password, $store->password)) {
            return back()->withErrors([
                'password' => 'Incorrect store password.',
            ]);
        }
        // Step 3: Success — continue logic
        // (e.g., mark session, redirect to dashboard, etc.)
        session(['store_logged_in' => $store->id]);

        return redirect()->route('store.products', $store->id)
            ->with('success', 'Successfully logged into the store.');
    }

    public function permissions(string $storeId)
    {
        try {
            $store = Store::findOrFail($storeId);
            $store_permissions = $store->plan->permissions;
            $permissions = Permission::all();
            $requested_permissions = RequestExtraPermission::where('store_id', $store->id)->where('status', 'pending')->get();
            $store_extra_permissions = StoreExtraPermission::where('store_id', $store->id)->get();

            return response()->json([
                'store_permissions' => $store_permissions,
                'all_permissions' => $permissions,
                'requested_permissions' => $requested_permissions,
                'store_extra_permissions' => $store_extra_permissions
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch permissions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function requestExtraPermission(string $storeId, string $permission_id)
    {
        try {
            // Create the permission request
            $request_permission = RequestExtraPermission::create([
                'store_id' => $storeId,
                'permission_id' => $permission_id,
                'status' => 'pending',
            ]);

            // Fetch all admin users
            $admin = User::where('type', 'admin')->first();

            Mail::to($admin->email)->send(new RequestPermissionMail($request_permission));

            return redirect()->back()->with('success', 'Request sent successfully and admins have been notified.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Something went wrong while sending request.');
        }
    }
}
