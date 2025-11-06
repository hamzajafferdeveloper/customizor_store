<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserExtraPermission extends Model
{
    protected $fillable = [
        'store_id',
        'limit',
        'user_id',
        'permission_id',
    ];
}
