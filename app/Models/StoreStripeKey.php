<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreStripeKey extends Model
{
    protected $fillable = [
        'store_id',
        'stripe_public_key',
        'stripe_secret_key',
    ];
}
