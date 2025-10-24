<?php

namespace App\Http\Resources; // <-- Pastikan namespace-nya Resources (plural)

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
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
            'quantity' => $this->quantity,
            // 'price' adalah harga buku PADA SAAT checkout
            'price' => $this->price, 

            // Ini akan menyertakan seluruh detail buku
            // (kita gunakan 'whenLoaded' untuk efisiensi)
            'book' => BookResource::make($this->whenLoaded('book')),
        ];
    }
}