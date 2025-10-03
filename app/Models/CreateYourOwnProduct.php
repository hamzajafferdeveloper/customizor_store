<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreateYourOwnProduct extends Model
{
    protected $fillable = [
        'category_id',
        'image'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
