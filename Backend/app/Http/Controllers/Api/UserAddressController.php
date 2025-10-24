<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserAddressResource; // Resource kita
use App\Models\UserAddress; // Model kita
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserAddressController extends Controller
{
    /**
     * Mengambil semua alamat milik user yang sedang login.
     * GET /api/addresses
     */
    public function index(Request $request)
    {
        // Ambil user yang sedang login
        $user = $request->user();

        // Ambil semua alamat milik user tsb
        $addresses = $user->addresses()->get();

        // Kembalikan sebagai koleksi JSON
        return UserAddressResource::collection($addresses);
    }

    /**
     * Menyimpan alamat baru untuk user yang sedang login.
     * POST /api/addresses
     */
    public function store(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'label' => 'required|string|max:100', // Cth: 'Rumah', 'Kantor'
            'recipient_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
        ]);

        $user = $request->user();

        // Buat alamat baru yang terhubung dengan user ini
        $address = $user->addresses()->create($validated);

        // Kembalikan data alamat yang baru dibuat
        return UserAddressResource::make($address);
    }

    /**
     * Mengupdate alamat yang sudah ada.
     * PUT /api/addresses/{id}
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();

        // Cari alamat di dalam daftar alamat milik user.
        // findOrFail() akan otomatis 404 jika tidak ketemu.
        // Ini mencegah user mengedit alamat milik user lain.
        $address = $user->addresses()->findOrFail($id);

        // Validasi input (gunakan 'sometimes' karena ini update)
        $validated = $request->validate([
            'label' => 'sometimes|required|string|max:100',
            'recipient_name' => 'sometimes|required|string|max:255',
            'phone_number' => 'sometimes|required|string|max:20',
            'address_line1' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'province' => 'sometimes|required|string|max:100',
            'postal_code' => 'sometimes|required|string|max:10',
        ]);

        // Update alamat
        $address->update($validated);

        return UserAddressResource::make($address);
    }

    /**
     * Menghapus alamat.
     * DELETE /api/addresses/{id}
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        // Cari dan hapus alamat milik user
        $address = $user->addresses()->findOrFail($id);
        $address->delete();

        // Kembalikan respons 204 (No Content)
        return response()->noContent();
    }
}