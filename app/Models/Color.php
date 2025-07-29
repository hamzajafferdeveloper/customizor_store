<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Color extends Model
{
    protected $fillable = ['name', 'hexCode'];

    public function products(){
        return $this->hasMany(Product::class);
    }
}
