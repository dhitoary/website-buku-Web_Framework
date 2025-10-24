<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource; // Resource keranjang kita
use App\Models\Book;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CartController extends Controller
{
    /**
     * Mendapatkan keranjang milik user yang sedang login.
     * GET /api/cart
     */
    public function show(Request $request): CartResource
    {
        // Ambil keranjang user, atau buat baru jika belum ada
        $cart = $this->getOrCreateCart($request);

        // Muat relasi agar 'total_price' dan 'items' bisa dihitung
        $cart->load('cartItems.book'); 

        return CartResource::make($cart);
    }

    /**
     * Menambahkan buku ke keranjang.
     * POST /api/cart/items
     */
    public function store(Request $request): CartResource
    {
        $validated = $request->validate([
            'book_id' => 'required|integer|exists:books,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getOrCreateCart($request);
        $book = Book::findOrFail($validated['book_id']);

        // Cek apakah item sudah ada di keranjang
        $item = $cart->cartItems()
                     ->where('book_id', $book->id)
                     ->first();

        if ($item) {
            // Jika sudah ada, tambahkan kuantitasnya
            $item->quantity += $validated['quantity'];
            $item->save();
        } else {
            // Jika belum ada, buat item baru
            $cart->cartItems()->create([
                'book_id' => $book->id,
                'quantity' => $validated['quantity'],
            ]);
        }

        // Muat ulang relasi untuk response
        $cart->load('cartItems.book');
        return CartResource::make($cart);
    }

    /**
     * Mengubah kuantitas item di keranjang.
     * PUT /api/cart/items/{itemId}
     */
    public function update(Request $request, string $itemId): CartResource
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getOrCreateCart($request);

        // Cari item HANYA di dalam keranjang user
        $item = $cart->cartItems()->findOrFail($itemId);

        $item->quantity = $validated['quantity'];
        $item->save();

        $cart->load('cartItems.book');
        return CartResource::make($cart);
    }

    /**
     * Menghapus item dari keranjang.
     * DELETE /api/cart/items/{itemId}
     */
    public function destroy(Request $request, string $itemId): CartResource
    {
        $cart = $this->getOrCreateCart($request);

        $item = $cart->cartItems()->findOrFail($itemId);
        $item->delete();

        $cart->load('cartItems.book');
        return CartResource::make($cart);
    }

    /**
     * Helper private untuk mengambil keranjang user
     */
    private function getOrCreateCart(Request $request): Cart
    {
        // $request->user() didapat dari 'auth:sanctum'
        $user = $request->user();

        // Ambil keranjang milik user, atau buat baru jika tidak ada
        $cart = $user->cart()->firstOrCreate();

        return $cart;
    }
}