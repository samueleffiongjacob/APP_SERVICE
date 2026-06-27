<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Lead extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'email', 'phone', 'service', 'message'];

    protected static function booted(): void
    {
        static::creating(fn($model) => $model->id = (string) Str::uuid());
    }
}