<?php

use App\Models\SoldPhysicalProduct;
use App\Models\SoldProduct;

if (!function_exists('get_buyed_products')) {
    function get_buyed_products()
    {
        $buyedProducts = [];

        $soldProducts = SoldProduct::where('user_id', auth()->id())->get();
        $soldPhysicalProducts = SoldPhysicalProduct::where('user_id', auth()->id())->get();

        // Normalize SoldProduct
        foreach ($soldProducts as $item) {
            $buyedProducts[] = [
                'store_id' => $item->store_id,
                'user_id' => $item->user_id,
                'product_id' => $item->product_id,
                'type' => 'digital',
                'full_item' => $item, // optional
            ];
        }

        // Normalize SoldPhysicalProduct
        foreach ($soldPhysicalProducts as $item) {
            $buyedProducts[] = [
                'store_id' => $item->store_id,
                'user_id' => $item->user_id,
                'product_id' => $item->product_id,
                'type' => 'physical',
                'full_item' => $item, // optional
            ];
        }

        return $buyedProducts;
    }
}
