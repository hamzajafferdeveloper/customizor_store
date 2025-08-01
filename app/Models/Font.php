<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Font extends Model
{
    protected $fillable = ['name', 'path'];

    public function plans()
    {
        return $this->belongsToMany(Plan::class, 'font_plans', 'font_id', 'plan_id');
    }
}
