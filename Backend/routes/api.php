<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import Controller yang kita butuhkan
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\UserAddressController;
use App\Http\Controllers\Api\CheckoutController; // <-- Import Checkout

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- RUTE PUBLIK (Tidak Perlu Login) ---
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Rute Autentikasi Publik
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- RUTE TERPROTEKSI (Butuh Login) ---
// INI ADALAH BARIS YANG DIPERBAIKI (TANPA TITIK)
Route::middleware('auth:sanctum')->group(function () {
    
    // Rute Auth yg terproteksi
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rute Keranjang
    Route::get('/cart', [CartController::class, 'show']); 
    Route::post('/cart/items', [CartController::class, 'store']); 
    Route::put('/cart/items/{itemId}', [CartController::class, 'update']); 
    Route::delete('/cart/items/{itemId}', [CartController::class, 'destroy']);
    
    // Rute Alamat
    Route::get('/addresses', [UserAddressController::class, 'index']); 
    Route::post('/addresses', [UserAddressController::class, 'store']); 
    Route::put('/addresses/{id}', [UserAddressController::class, 'update']); 
    Route::delete('/addresses/{id}', [UserAddressController::class, 'destroy']);

    // Rute Checkout
    Route::post('/checkout', [CheckoutController::class, 'store']);
});