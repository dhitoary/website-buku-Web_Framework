<?php

namespace App\Http\Resources; // <-- Pastikan namespace-nya Resources (plural)

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,

            // Ini akan memanggil CartItemResource untuk setiap item
            'items' => CartItemResource::collection($this->whenLoaded('cartItems')),

            // BARU: Hitung total item (misal: 5 buku)
            'total_items' => $this->whenLoaded('cartItems', function () {
                return $this->cartItems->sum('quantity');
            }),

            // BARU: Hitung total harga
            'total_price' => $this->whenLoaded('cartItems', function () {
                // Ini membutuhkan relasi 'cartItems.book' untuk di-load
                return $this->cartItems->reduce(function ($total, $item) {
                    // $item->book->price didapat dari relasi
                    return $total + ($item->quantity * ($item->book->price ?? 0));
                }, 0);
            }),
        ];
    }
}