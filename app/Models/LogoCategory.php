<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogoCategory extends Model
{
    protected $fillable = ['name'];

    public function logos()
    {
        return $this->hasMany(LogoGallery::class, 'category_id');
    }
}
