<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreExtraPermission extends Model
{
    protected $fillable = [
        'store_id',
        'permission_id',
        'limit',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }
}
