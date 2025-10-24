<?php
// File: Backend/app/Listeners/DecreaseStockListener.php

namespace App\Listeners;

use App\Events\OrderProcessed;
use App\Models\Book; // <-- 1. Import model Book
use Illuminate\Contracts\Queue\ShouldQueue; // (Opsional: untuk performa)
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log; // <-- 2. Untuk logging

class DecreaseStockListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     * Ini adalah "otak" yang menggantikan trigger DB kita.
     */
    public function handle(OrderProcessed $event): void
    {
        Log::info("Menjalankan DecreaseStockListener untuk Order ID: {$event->order->id}");

        try {
            // 3. Ambil semua item dari pesanan yang dibawa oleh event
            $orderItems = $event->order->items;

            foreach ($orderItems as $item) {
                // 4. Temukan buku yang sesuai
                $book = Book::find($item->book_id);

                if ($book) {
                    // 5. Kurangi stok (decrement)
                    $book->decrement('stock', $item->quantity);
                    Log::info("Stok buku #{$book->id} dikurangi {$item->quantity}. Stok sisa: {$book->stock}");
                } else {
                    Log::warning("Buku #{$item->book_id} tidak ditemukan untuk pengurangan stok.");
                }
            }
        } catch (\Exception $e) {
            // 6. Catat jika terjadi error
            Log::error("Error saat mengurangi stok: " . $e->getMessage());
            // Di aplikasi produksi, kamu mungkin ingin mengirim notifikasi
            // ke admin jika ini gagal.
        }
    }
}