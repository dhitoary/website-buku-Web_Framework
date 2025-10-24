<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 1. TAMBAHKAN 'use' UNTUK BOOK CONTROLLER
use App\Http\Controllers\Api\BookController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// 2. TAMBAHKAN RUTE 'books' YANG HILANG
Route::get('/books', [BookController::class, 'index']);