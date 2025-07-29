<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SvgTemplate extends Model
{
    protected $fillable = [
        'name',
        'product_id',
        'template'
    ];

    public function product(){
        return $this->belongsTo(Product::class);
    }

    public function part()
    {
        return $this->hasMany(SvgTemplatePart::class, 'template_id');
    }
}
