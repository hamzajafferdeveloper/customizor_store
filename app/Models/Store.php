<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Traits\HasRoles;

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

}
