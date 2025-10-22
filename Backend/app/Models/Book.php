<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    /**
     * Kolom-kolom yang boleh diisi secara massal (mass assignable).
     * Ini adalah praktik keamanan untuk mencegah pengisian data yang tidak diinginkan.
     */
    protected $fillable = [
        'user_id',
        'title',
        'author',
        'publisher',
        'year_published',
        'description',
        'cover_image_url',
    ];

    /**
     * Mendefinisikan relasi ke model User.
     * 'belongsTo' berarti "buku ini dimiliki oleh" satu User.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
