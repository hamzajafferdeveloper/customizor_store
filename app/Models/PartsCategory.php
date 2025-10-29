<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartsCategory extends Model
{
    protected $fillable = ['name', 'own_product_id'];

    public function parts(){
        return $this->hasMany(Part::class);
    }
}
