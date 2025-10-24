<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        // Ini adalah kode Anda yang sudah ada untuk 'admin'. JANGAN DIHAPUS.
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
            // Kamu bisa tambahkan alias lain di sini
            // 'auth' => ... (biasanya sudah ada by default)
        ]);

        // --- TAMBAHKAN 2 BLOK INI ---
        // Kita tambahkan pengaturan API di bawah alias Anda.
        
        $middleware->validateCsrfTokens(except: [
            'api/*', // Izinkan rute API tanpa token CSRF
        ]);

        $middleware->statefulApi(); // KUNCI untuk login dari React
        // -----------------------------

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();