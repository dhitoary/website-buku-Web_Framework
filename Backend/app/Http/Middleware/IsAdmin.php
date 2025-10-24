<?php
// File: Backend/app/Http/Middleware/IsAdmin.php

namespace App\Http\Middleware; // Pastikan namespace-nya App\Http\Middleware

use Closure;
use Illuminate; // Namespace global
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- 1. Import 'Auth'
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     * Ini adalah "otak" dari Satpam kita.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 2. Cek: Apakah user sudah login DAN apakah rolenya 'admin'?
        // Kita mengambil 'role' dari tabel 'users' yang sudah kita migrasi.
        if (Auth::check() && Auth::user()->role == 'admin') {
            
            // 3. JIKA YA: Izinkan request melanjutkan ke Controller
            return $next($request);
        }

        // 4. JIKA TIDAK: Tolak request
        // Kirim response JSON 'Forbidden' (Dilarang)
        return response()->json(
            [
                'message' => 'Forbidden: Anda tidak memiliki hak akses Admin.'
            ],
            403 // 403 adalah kode status HTTP untuk "Forbidden"
        );
    }
}