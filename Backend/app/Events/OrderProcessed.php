<?php
// File: Backend/app/Events/OrderProcessed.php

namespace App\Events;

use App\Models\Order; // <-- 1. Import model Order
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderProcessed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Properti publik ini akan membawa data Order
     * ke semua Listener.
     */
    public Order $order; // <-- 2. Buat properti publik

    /**
     * Create a new event instance.
     */
    public function __construct(Order $order) // <-- 3. Terima Order saat dibuat
    {
        $this->order = $order; // <-- 4. Simpan Order
    }
}