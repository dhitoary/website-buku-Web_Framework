<?php
// File: Backend/routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import Controller
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CheckoutController;
// use App\Http\Controllers\Api\Admin\AdminOrderController; // Untuk nanti


// =================================================================
// RUTE PUBLIK
// =================================================================
// Buku (Read-Only)
Route::get('/books', [BookController::class, 'index']); // Daftar buku (paginasi)
Route::get('/books/{id}', [BookController::class, 'show']); // Detail buku

// Autentikasi
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// =================================================================
// RUTE USER (Perlu Login - auth:sanctum)
// =================================================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Checkout
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // (Rute lain untuk user: cart, my-orders, my-profile, dll.)

});


// =================================================================
// RUTE ADMIN (Perlu Login & Role Admin - ['auth:sanctum', 'admin'])
// =================================================================
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin') // URL prefix /api/admin/...
    ->group(function () {

    // CRUD Buku Lengkap
    Route::post('/books', [BookController::class, 'store']);    // Create
    // (Read sudah ada di publik, tapi bisa juga ditambahkan di sini jika perlu)
    Route::put('/books/{id}', [BookController::class, 'update']);     // Update (PUT atau PATCH)
    Route::delete('/books/{id}', [BookController::class, 'destroy']); // Delete (Soft Delete)

    // (Rute lain untuk admin: CRUD authors, publishers, categories, manage orders, dashboard, dll.)
    
    // Rute Tes Keamanan
    Route::get('/test', function (Request $request) {
        return response()->json([
            'message' => 'Selamat datang, Admin!',
            'user' => $request->user(),
        ]);
    });
});