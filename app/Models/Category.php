<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug_short'];

    public function products(){
        return $this->hasMany(Product::class);
    }

    public function ownProductImage(){
        return $this->hasOne(CreateYourOwnProduct::class);
    }
}
