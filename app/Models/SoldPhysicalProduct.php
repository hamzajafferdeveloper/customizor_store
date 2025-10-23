<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoldPhysicalProduct extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'store_id',
        'price',
        'name',
        'number',
        'email',
        'country',
        'address',
        'has_delivery_address',
        'delivery_address',
        'payment_status',
        'file',
        'order_status'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
