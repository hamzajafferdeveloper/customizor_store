<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogoGallery extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'source'
    ];
}
