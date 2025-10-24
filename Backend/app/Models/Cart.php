<?php
// File: Backend/app/Models/Cart.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    /**
     * Keranjang (cart) bersifat sementara (ephemeral),
     * jadi kita tidak menggunakan SoftDeletes.
     * Migrasi kita juga tidak menambahkannya.
     */
    
    protected $fillable = [
        'user_id',
    ];

    // =================================================================
    // RELASI ELOQUENT
    // =================================================================

    /**
     * Relasi 1-1: Keranjang ini dimiliki oleh seorang User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Relasi 1-N: Keranjang ini memiliki banyak Item
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class, 'cart_id', 'id');
    }
}