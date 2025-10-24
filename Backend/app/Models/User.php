<?php
// File: Backend/app/Models/User.php

namespace App\Models;

// Gunakan ini untuk menggantikan App\Models\User yang lama
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes; // <-- 1. Tambahkan SoftDeletes
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // <-- 2. Tambahkan HasApiTokens untuk API

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens; // <-- 3. Gunakan traits

    /**
     * Kolom yang boleh diisi secara massal.
     * Kita tambahkan 'full_name' dan 'role' (meskipun 'role' harus hati-hati).
     */
    protected $fillable = [
        'full_name', // <-- 4. Ganti 'name' menjadi 'full_name'
        'email',
        'password',
        'role', // <-- 5. Tambahkan 'role'
        'profile_image_url', // <-- 6. Tambahkan 'profile_image_url'
    ];

    /**
     * Kolom yang harus disembunyikan saat di-serialize (cth: jadi JSON).
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Kolom yang harus di-cast ke tipe data tertentu.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed', // <-- 7. Pastikan password otomatis di-hash
    ];

    // =================================================================
    // RELASI ELOQUENT
    // =================================================================

    /**
     * Relasi 1-N: Satu User memiliki banyak Alamat
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(UserAddress::class, 'user_id', 'id');
    }

    /**
     * Relasi 1-N: Satu User memiliki banyak Pesanan
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    /**
     * Relasi 1-1: Satu User memiliki satu Keranjang
     */
    public function cart()
    {
        return $this->hasOne(Cart::class, 'user_id', 'id');
    }
}