<?php
// File: Backend/app/Models/Book.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes; // <-- 1. Tambahkan SoftDeletes

class Book extends Model
{
    use HasFactory, SoftDeletes; // <-- 2. Gunakan traits

    /**
     * Kolom yang boleh diisi secara massal.
     * Kita ganti dari yang lama, sesuaikan dengan migrasi baru.
     */
    protected $fillable = [
        'publisher_id', // <-- 3. Ganti user_id
        'title',
        'isbn',
        'description',
        'page_count',
        'published_year',
        'price', // <-- 4. Tambahkan price
        'stock', // <-- 5. Tambahkan stock
        'cover_image_url',
    ];

    /**
     * Kolom yang harus di-cast.
     */
    protected $casts = [
        'price' => 'decimal:2',
        'page_count' => 'integer',
        'published_year' => 'integer',
        'stock' => 'integer',
    ];

    // =================================================================
    // RELASI ELOQUENT
    // =================================================================

    /**
     * Relasi N-1: Satu Buku dimiliki oleh satu Penerbit
     */
    public function publisher(): BelongsTo
    {
        return $this->belongsTo(Publisher::class, 'publisher_id', 'id');
    }

    /**
     * Relasi N-N: Satu Buku bisa ditulis banyak Penulis
     */
    public function authors(): BelongsToMany
    {
        // 'book_author' adalah nama tabel junction kita
        return $this->belongsToMany(Author::class, 'book_author', 'book_id', 'author_id');
    }

    /**
     * Relasi N-N: Satu Buku bisa memiliki banyak Kategori
     */
    public function categories(): BelongsToMany
    {
        // 'book_category' adalah nama tabel junction kita
        return $this->belongsToMany(Category::class, 'book_category', 'book_id', 'category_id');
    }
}