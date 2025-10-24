<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckoutService; // <-- Ini class yg error 'not found'
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckoutController extends Controller
{
    // Ini adalah controller yang benar
    public function store(Request $request, CheckoutService $checkoutService)
    {
        $user = Auth::user();

        // Validasi input (misal: alamat_id, metode_pembayaran)
        $validated = $request->validate([
            'address_id' => 'required|integer|exists:user_addresses,id',
            'payment_method' => 'required|string|in:manual_transfer,cod', // Sesuaikan
        ]);

        try {
            // Panggil service yang canggih itu
            $order = $checkoutService->processCheckout(
                $user,
                $validated['address_id'],
                $validated['payment_method']
            );

            // Jika berhasil, kembalikan data order
            return response()->json([
                'message' => 'Checkout berhasil diproses.',
                'order_id' => $order->id,
                'total_amount' => $order->total_amount,
                'payment_status' => $order->payment->status,
            ], 201); // 201 Created

        } catch (\Exception $e) {
            // Tangani jika ada error (misal: keranjang kosong)
            return response()->json([
                'message' => 'Checkout gagal: ' . $e->getMessage()
            ], 422); // Unprocessable Entity
        }
    }
}