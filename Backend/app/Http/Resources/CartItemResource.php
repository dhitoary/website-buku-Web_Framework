<?php

namespace App\Http\Resources; // <-- Pastikan namespace-nya Resources (plural)

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
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
            'cart_id' => $this->cart_id,
            'quantity' => $this->quantity,

            // Ini akan menyertakan seluruh detail buku
            // menggunakan BookResource yang sudah kita punya
            'book' => BookResource::make($this->whenLoaded('book')),
        ];
    }
}