<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SvgTemplatePart extends Model
{
    protected $fillable = [
        'id',
        'part_id',
        'template_id',
        'name',
        'type',
        'color',
        'is_group'
    ];

    public function template(){
        return $this->belongsTo(SvgTemplate::class);
    }
}
