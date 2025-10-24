<?php

namespace App\Http\Resources; // <-- Pastikan namespace-nya Resources (plural)

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'order_code' => $this->order_code,
            'status' => $this->status, // Cth: 'pending', 'processing', 'completed'
            'total_amount' => $this->total_amount,
            'created_at' => $this->created_at->format('d M Y, H:i'), // Format tanggal

            // Info Alamat Pengiriman (disimpan sebagai JSON di tabel 'orders')
            'shipping_address' => $this->shipping_address, 

            // Info Pembayaran
            'payment_method' => $this->payment->payment_method ?? '-',
            'payment_status' => $this->payment->status ?? 'pending',

            // Daftar item-item di dalam pesanan ini
            'items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
        ];
    }
}