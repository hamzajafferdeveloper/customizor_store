<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Part extends Model
{
    protected $fillable = [ 'parts_category_id', 'name', 'path' ];

    public function category(){
        return $this->belongsTo(PartsCategory::class);
    }
}
