<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreBanner extends Model
{
    protected $fillable = [ 'store_id', 'path' ];

    public function store(){
        return $this->belongsTo(Store::class);
    }
}
