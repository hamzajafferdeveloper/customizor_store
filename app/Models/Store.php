<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    protected $fillable = [
        'name',
        'user_id',
        'plan_id',
        'payment_detail_id',
        'email',
        'country',
        'phone',
        'logo',
        'type',
        'status',
        'bio',
        'plan_expiry_date',
        'password',
        'store_key',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function paymentDetail()
    {
        return $this->belongsTo(PaymentDetail::class);
    }

    public function banner()
    {
        return $this->hasOne(StoreBanner::class);
    }

    public function stripeKeys()
    {
        return $this->hasOne(StoreStripeKey::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'store_users');
    }

    public function extraPermissions()
    {
        return $this->hasMany(StoreExtraPermission::class);
    }

}
