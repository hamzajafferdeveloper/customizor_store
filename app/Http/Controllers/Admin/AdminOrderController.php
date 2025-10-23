<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SoldPhysicalProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = SoldPhysicalProduct::where('user_id', $user->id)->with('product');

        // Search filter
        if ($request->has('search') && $request->search !== '') {
            $query->whereHas('product', function ($q) use ($request) {
                $q->where('title', 'like', '%'.$request->search.'%');
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $orders = $query->paginate($perPage)->appends($request->all());

        return Inertia::render('super-admin/order/index', [
            'orders' => $orders,
        ]);
    }

    public function show(string $id)
    {
        $order = SoldPhysicalProduct::findOrFail($id);

        return Inertia::render('super-admin/order/show', [
            'order' => $order,
        ]);
    }
}
