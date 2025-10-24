<?php

namespace App\Http\Resources; // <-- Pastikan namespace-nya Resources (plural)

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserAddressResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Mengambil semua data dari model UserAddress
        // Model Anda sudah punya $fillable, jadi kita bisa pakai 'toArray'
        return parent::toArray($request);

        /*
        // Atau jika Anda ingin memilih kolom secara manual:
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'label' => $this->label,
            'recipient_name' => $this->recipient_name,
            'phone_number' => $this->phone_number,
            'address_line1' => $this->address_line1,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'is_default' => (bool) $this->is_default, // pastikan boolean
        ];
        */
    }
}