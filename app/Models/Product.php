<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['image', 'title', 'sku', 'price', 'store_id', 'brand_id' , 'user_id', 'slug', 'product_type_id', 'sizes', 'materials', 'categories_id', 'price_type'];

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

    public function productType()
    {
        return $this->belongsTo(ProductType::class);
    }
}
