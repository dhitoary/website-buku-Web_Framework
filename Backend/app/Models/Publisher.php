<?php
// File: Backend/app/Models/Publisher.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Publisher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name'];

    /**
     * Relasi 1-N: Satu Penerbit bisa memiliki banyak Buku
     */
    public function books(): HasMany
    {
        return $this->hasMany(Book::class, 'publisher_id', 'id');
    }
}