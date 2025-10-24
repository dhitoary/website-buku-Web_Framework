<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request; 

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // Pengaturan 'admin' Anda yang sudah ada
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
        ]);

        // Pengaturan CSRF Anda yang sudah ada
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        // Pengaturan Sanctum Anda yang sudah ada
        $middleware->statefulApi(); 

        // --- TAMBAHAN KRUSIAL UNTUK FIX CORS ---
        // Ini memberitahu Laravel untuk menjalankan middleware CORS
        // (yang aturannya kita buat di cors.php) untuk semua rute 'api/*'
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        // ----------------------------------------

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();