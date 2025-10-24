<?php
// File: Backend/app/Services/CheckoutService.php

namespace App\Services;

// Import model yang dibutuhkan
use App\Models\Book;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use App\Models\UserAddress;
// Import Facade DB untuk transaksi
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; // Untuk generate order_code unik
use InvalidArgumentException; // Untuk error handling

class CheckoutService
{
    /**
     * Memproses checkout pengguna.
     *
     * @param User $user Pengguna yang melakukan checkout.
     * @param int $userAddressId ID alamat pengiriman yang dipilih.
     * @param float $shippingCost Biaya pengiriman (misalnya didapat dari API pihak ketiga).
     * @return Order Objek Order yang baru dibuat.
     * @throws InvalidArgumentException Jika keranjang kosong atau alamat tidak valid.
     * @throws \Exception Jika terjadi error saat menyimpan ke database.
     */
    public function processCheckout(User $user, int $userAddressId, float $shippingCost = 0.00): Order
    {
        // 1. Validasi Input Dasar
        $cart = $user->cart()->with('items.book')->first(); // Ambil keranjang beserta item & bukunya
        if (!$cart || $cart->items->isEmpty()) {
            throw new InvalidArgumentException('Keranjang belanja kosong.');
        }

        $address = $user->addresses()->find($userAddressId);
        if (!$address) {
            throw new InvalidArgumentException('Alamat pengiriman tidak valid.');
        }

        // 2. Kalkulasi Total Harga Item
        $totalItemsPrice = 0;
        foreach ($cart->items as $item) {
            // Pastikan buku masih ada dan punya harga
            if ($item->book) {
                // Gunakan harga dari tabel 'books' saat ini
                $totalItemsPrice += $item->book->price * $item->quantity;
            } else {
                // Handle jika buku sudah dihapus (meskipun jarang terjadi di cart)
                throw new InvalidArgumentException("Buku dengan ID {$item->book_id} tidak ditemukan di keranjang.");
            }
        }

        // 3. Kalkulasi Total Keseluruhan
        $totalAmount = $totalItemsPrice + $shippingCost;

        // 4. Generate Kode Pesanan Unik
        $orderCode = $this->generateUniqueOrderCode();

        // 5. Gunakan Transaksi Database (SANGAT PENTING!)
        // Ini memastikan SEMUA operasi (buat order, item, payment, hapus cart)
        // berhasil, atau GAGAL SEMUA (rollback). Mencegah data inkonsisten.
        $order = DB::transaction(function () use (
            $user,
            $address,
            $cart,
            $orderCode,
            $totalItemsPrice,
            $shippingCost,
            $totalAmount
        ) {
            // 5a. Buat Order (Header)
            $newOrder = Order::create([
                'user_id' => $user->id,
                'user_address_id' => $address->id,
                'order_code' => $orderCode,
                'status' => 'menunggu_pembayaran', // Status awal
                'total_items_price' => $totalItemsPrice,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
            ]);

            // 5b. Buat Order Items (Detail + Snapshot)
            foreach ($cart->items as $item) {
                // Lakukan snapshot data buku SAAT INI
                $bookTitle = $item->book ? $item->book->title : '[Buku Dihapus]';
                $bookPrice = $item->book ? $item->book->price : 0.00; // Harga saat checkout

                OrderItem::create([
                    'order_id' => $newOrder->id,
                    'book_id' => $item->book_id, // Tetap simpan ID-nya
                    'quantity' => $item->quantity,
                    'snapshot_book_title' => $bookTitle,
                    'snapshot_price_per_item' => $bookPrice,
                ]);

                // Di sini kita BELUM mengurangi stok.
                // Pengurangan stok akan dilakukan oleh Listener
                // saat status order diubah menjadi 'diproses'.
            }

            // 5c. Buat Payment Record
            Payment::create([
                'order_id' => $newOrder->id,
                'status' => 'pending', // Status awal pembayaran
                'payment_method' => 'qris_manual', // Sesuai migrasi default
                'amount_due' => $totalAmount, // Jumlah yang harus dibayar
                // amount_paid akan diisi nanti saat konfirmasi
            ]);

            // 5d. Kosongkan Keranjang Pengguna
            $cart->items()->delete(); // Hapus semua CartItem yang terkait

            // 5e. Kembalikan Order yang baru dibuat
            return $newOrder;
        }); // Akhir dari DB::transaction()

        // 6. Kembalikan hasil transaksi
        return $order;
    }

    /**
     * Helper untuk generate kode pesanan unik.
     * Contoh: INV-20251024-ABCDE
     */
    protected function generateUniqueOrderCode(): string
    {
        $prefix = 'INV';
        $date = now()->format('Ymd'); // Format tanggal YYYYMMDD
        
        do {
            $random = strtoupper(Str::random(5)); // 5 karakter acak
            $code = "{$prefix}-{$date}-{$random}";
        } while (Order::where('order_code', $code)->exists()); // Pastikan benar-benar unik

        return $code;
    }
}