<?php
// File: Backend/app/Http/Controllers/Api/CheckoutController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckoutService; // <-- 1. Import Service kita
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Untuk mendapatkan user yang login
use Illuminate\Support\Facades\Log; // Untuk logging
use InvalidArgumentException; // Untuk menangkap error dari service

class CheckoutController extends Controller
{
    // 2. Deklarasikan properti untuk menampung service
    protected CheckoutService $checkoutService;

    // 3. Inject Service melalui constructor (Dependency Injection)
    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    /**
     * Menangani request POST untuk melakukan checkout.
     */
    public function store(Request $request)
    {
        // 4. Validasi request dari Frontend (React)
        $validated = $request->validate([
            // Pastikan frontend mengirim ID alamat yang dipilih
            'user_address_id' => 'required|integer|exists:user_addresses,id', 
            // Biaya kirim mungkin didapat dari frontend atau dihitung di sini
            'shipping_cost' => 'sometimes|numeric|min:0', 
        ]);

        // 5. Dapatkan user yang sedang login
        $user = Auth::user();

        try {
            // 6. Panggil Service (Perintah si "Bos" ke "Manajer")
            // Kita panggil metode 'processCheckout' yang sudah kita buat
            $order = $this->checkoutService->processCheckout(
                $user,
                $validated['user_address_id'],
                $validated['shipping_cost'] ?? 0.00 // Ambil ongkir atau default 0
            );

            // 7. Jika berhasil, kirim response sukses ke React
            return response()->json([
                'message' => 'Checkout berhasil diproses.',
                'order_code' => $order->order_code, // Kirim kode order untuk info
                'order_id' => $order->id,         // Kirim ID order untuk redirect mungkin
                'total_amount' => $order->total_amount, // Total yang harus dibayar
            ], 201); // Kode 201 artinya 'Created'

        } catch (InvalidArgumentException $e) {
            // 8a. Tangani error validasi dari Service (Keranjang kosong / Alamat salah)
            return response()->json(['message' => $e->getMessage()], 400); // Kode 400 Bad Request
        } catch (\Exception $e) {
            // 8b. Tangani error database atau error tak terduga lainnya
            Log::error("Checkout Gagal: " . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat memproses checkout.'], 500); // Kode 500 Internal Server Error
        }
    }
}