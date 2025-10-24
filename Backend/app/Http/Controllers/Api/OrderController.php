<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource; // Resource kita
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Mengambil daftar (riwayat) pesanan milik user yang sedang login.
     * GET /api/orders
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Ambil semua pesanan milik user, urutkan dari yang terbaru
        // 'payment' adalah relasi di model Order
        $orders = $user->orders()
                       ->with('payment') // Eager load info pembayaran
                       ->orderBy('created_at', 'desc')
                       ->paginate(10); // Paginasi, 10 pesanan per halaman

        // Kembalikan sebagai koleksi JSON
        return OrderResource::collection($orders);
    }

    /**
     * Mengambil detail satu pesanan spesifik.
     * GET /api/orders/{id}
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();

        // Cari pesanan di dalam daftar pesanan milik user.
        // findOrFail() akan otomatis 404 jika tidak ketemu
        // atau jika pesanan itu bukan milik user ini.
        $order = $user->orders()->findOrFail($id);

        // Muat relasi detailnya: items dan buku di dalam items
        $order->load('orderItems.book', 'payment');

        // Kembalikan sebagai JSON
        return OrderResource::make($order);
    }
}