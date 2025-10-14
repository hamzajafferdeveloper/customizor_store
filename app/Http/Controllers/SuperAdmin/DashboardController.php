<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PaymentDetail;
use App\Models\Product;
use App\Models\SoldProduct;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $months = collect(range(5, 0))->map(function ($i) {
            return now()->subMonths($i)->format('Y-m'); // Last 6 months
        });

        // Helper for monthly chart data
        $getMonthlyData = function ($model, $column = 'COUNT(*)') use ($months) {
            $rawData = $model::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, ' . $column . ' as total')
                ->where('created_at', '>=', now()->subMonths(6))
                ->groupBy('month')
                ->pluck('total', 'month');

            return $months->map(fn($m) => $rawData[$m] ?? 0)->toArray();
        };

        // Chart Data
        $revenueData = $getMonthlyData(new PaymentDetail(), 'SUM(amount)');
        $usersData = $getMonthlyData(new User());
        $storesData = $getMonthlyData(new Store());
        $productData = $getMonthlyData(new Product());
        $soldProductData = $getMonthlyData(new SoldProduct());

        // Growth calculation
        $calculateGrowth = function ($data) {
            if (count($data) < 2)
                return 0;
            $last = end($data);
            $prev = $data[count($data) - 2];
            return $prev > 0 ? round((($last - $prev) / $prev) * 100, 2) : ($last > 0 ? 100 : 0);
        };

        // Store chart data (last 3 months)
        $storeChartData = Store::selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->where('created_at', '>=', now()->subMonths(3))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $soldProductChartData = SoldProduct::selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->where('created_at', '>=', now()->subMonths(3))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Country chart data
        $countryData = Store::selectRaw('country, COUNT(*) as total')
            ->groupBy('country')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => [
                'country' => $item->country,
                'total' => $item->total,
                'code' => strtoupper(substr($item->country, 0, 2))
            ]);

        /**
         * Stores Table with Filters
         */
        $storeQuery = Store::query();

        if ($request->search) {
            $storeQuery->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->type && in_array($request->type, ['public', 'protected'])) {
            $storeQuery->where('type', $request->type);
        }

        if ($request->country) {
            $storeQuery->where('country', $request->country);
        }

        $stores = $storeQuery->orderBy('created_at', 'desc')->paginate(10);
        $countries = Store::select('country')->distinct()->pluck('country');

        /**
         * Users Table with Filters
         */
        $userQuery = User::query();

        if ($request->user_search) {
            $userQuery->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->user_search . '%')
                    ->orWhere('email', 'like', '%' . $request->user_search . '%');
            });
        }

        if ($request->user_type && in_array($request->user_type, ['admin', 'user'])) {
            $userQuery->where('type', $request->user_type);
        }

        $users = $userQuery->where('type','user')->orderBy('created_at', 'desc')->paginate(10);

        /**
         * Dashboard Page
         */

        return Inertia::render('super-admin/dashboard', [
            'stats' => [
                'revenue' => [
                    'total' => PaymentDetail::sum('amount'),
                    'growth' => $calculateGrowth($revenueData),
                    'chart' => $revenueData
                ],
                'users' => [
                    'total' => User::count(),
                    'growth' => $calculateGrowth($usersData),
                    'chart' => $usersData
                ],
                'stores' => [
                    'total' => Store::count(),
                    'growth' => $calculateGrowth($storesData),
                    'chart' => $storesData
                ],
                'products' => [
                    'total' => Product::count(),
                    'growth' => $calculateGrowth($productData),
                    'chart' => $productData
                ],
                'soldProducts' => [
                    'total' => SoldProduct::sum('price'),
                    'growth' => $calculateGrowth($soldProductData),
                    'chart' => $soldProductData
                ]
            ],
            'storeChart' => $storeChartData,
            'soldProductChart' => $soldProductChartData,
            'countryChart' => $countryData,
            'stores' => $stores,
            'users' => $users,
            'filters' => [
                'store' => [
                    'search' => $request->search,
                    'type' => $request->type,
                    'country' => $request->country
                ],
                'user' => [
                    'search' => $request->user_search,
                    'type' => $request->user_type
                ]
            ],
            'countries' => $countries
        ]);
    }
}
