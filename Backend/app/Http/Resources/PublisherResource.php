<?php

// File: Backend/app/Http/Resources/PublisherResource.php

namespace App\Http\Resources; // <-- INI YANG DIPERBAIKI (dulu App\Http)

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublisherResource extends JsonResource
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
            'name' => $this->name,
            // 'address' => $this.address, // (jika ada)
        ];
    }
}