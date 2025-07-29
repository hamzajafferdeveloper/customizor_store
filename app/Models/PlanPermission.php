<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanPermission extends Model
{
    protected $fillable = [
        'plan_id',
        'permission_id',
        'is_enabled',
        'limit',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }
}
