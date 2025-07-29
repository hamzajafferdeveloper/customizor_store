<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = [
        'key',
        'description',
    ];

    public function plans()
    {
        return $this->belongsToMany(PlanPermission::class, 'plan_permissions')
            ->withPivot('is_enabled', 'limit');
    }
}
