<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['image', 'title', 'sku', 'price', 'store_id', 'user_id', 'slug', 'type', 'sizes', 'materials', 'categories_id', 'price_type'];

    protected $casts = [
        'sizes' => 'array',
        'materials' => 'array',
    ];


    public function productColors()
    {
        return $this->hasMany(ProductColors::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function template()
    {
        return $this->hasOne(SvgTemplate::class);
    }
}
