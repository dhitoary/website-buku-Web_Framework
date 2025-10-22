<?php

use App\Http\Controllers\Api\BookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Di sinilah Anda dapat mendaftarkan rute API untuk aplikasi Anda. Rute-rute
| ini dimuat oleh RouteServiceProvider dan secara otomatis diberi awalan
| '/api'.
|
*/

// Rute ini (dari Sanctum) akan berguna saat kita membuat fitur login.
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Ini adalah baris terpenting: Mendaftarkan semua endpoint CRUD
// untuk buku ke BookController.
Route::apiResource('books', BookController::class);

