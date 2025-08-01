<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Traits\HasRoles;

class Plan extends Model
{

    protected $fillable = [
        'name',
        'description',
        'price',
        'billing_cycle', // e.g., monthly, yearly
        'features', // JSON or text field for features
    ];

    protected $casts = [
        'features' => 'array',
    ];


    public function stores()
    {
        return $this->hasMany(Store::class);
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'plan_permissions')
            ->withPivot('is_enabled', 'limit');
    }

    public function fonts()
    {
        return $this->belongsToMany(Font::class, 'font_plans', 'plan_id', 'font_id');
    }
}
