<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentDetail extends Model
{
    protected $fillable = [
        'user_id',
        'plan_id',
        'stripe_payment_id',
        'amount',
        'type',
    ];
}
