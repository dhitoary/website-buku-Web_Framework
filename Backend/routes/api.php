<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\AuthController; // Pastikan ini di-import

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rute Publik (tidak perlu login)
Route::post('/register', [AuthController::class, 'register'])->name('register'); // Memberi nama rute (opsional)
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/books', [BookController::class, 'index'])->name('books.index');
Route::get('/books/{book}', [BookController::class, 'show'])->name('books.show');

// Grup Rute yang Membutuhkan Login (Dilindungi 'auth:sanctum')
Route::middleware('auth:sanctum')->group(function () {

    // Rute untuk mendapatkan data user yang login saat ini
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->name('user');

    // Rute Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Rute CRUD Buku yang dilindungi
    // Kita gunakan apiResource untuk cara yang lebih singkat
    // Ini otomatis membuat rute untuk store, update, destroy
    // Route::post('/books', [BookController::class, 'store']); // Sudah dicakup apiResource
    // Route::put('/books/{book}', [BookController::class, 'update']); // Sudah dicakup apiResource
    // Route::delete('/books/{book}', [BookController::class, 'destroy']); // Sudah dicakup apiResource

    // Cara lebih singkat:
    Route::apiResource('books', BookController::class)->except(['index', 'show']); // Kecualikan index & show karena sudah publik

    // Jika Anda lebih suka menulis satu per satu (seperti di atas, juga boleh):
    // Route::post('/books', [BookController::class, 'store'])->name('books.store');
    // Route::put('/books/{book}', [BookController::class, 'update'])->name('books.update'); // PUT atau PATCH
    // Route::delete('/books/{book}', [BookController::class, 'destroy'])->name('books.destroy');
});

