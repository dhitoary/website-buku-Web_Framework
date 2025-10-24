<?php
// File: Backend/bootstrap/app.php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware; // <-- 1. Pastikan ini di-import

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // <-- Rute API kita
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        // ========================================================
        // TAMBAHKAN BLOK INI:
        // Mendaftarkan "nama panggilan" (alias) untuk middleware kita
        // ========================================================
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
            // Kamu bisa tambahkan alias lain di sini
            // 'auth' => ... (biasanya sudah ada by default)
        ]);
        // ========================================================

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();