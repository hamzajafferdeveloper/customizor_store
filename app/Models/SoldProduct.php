<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoldProduct extends Model
{
    protected $fillable = [
        'product_id',
        'store_id',
        'user_id',
        'quantity',
        'price'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
