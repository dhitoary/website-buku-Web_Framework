<?php

// Perbaikan ada di baris ini
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    /**
     * Menampilkan daftar semua buku dengan pagination.
     * Ini adalah cara yang benar untuk menangani 200 data.
     */
    public function index()
    {
        // Ambil semua buku, urutkan dari yang terbaru, dan paginasi 10 per halaman.
        // React nanti bisa meminta halaman selanjutnya (misal: /api/books?page=2)
        $books = Book::latest()->paginate(10);

        return response()->json($books);
    }

    /**
     * Menyimpan buku baru.
     * (Akan kita isi nanti saat membuat fitur Admin)
     */
    public function store(Request $request)
    {
        // Logika untuk membuat buku baru akan ada di sini
    }

    /**
     * Menampilkan satu buku spesifik berdasarkan ID-nya.
     */
    public function show(Book $book)
    {
        // 'Route Model Binding' Laravel secara otomatis akan menemukan buku
        // berdasarkan ID yang ada di URL (misal: /api/books/1)
        return response()->json($book);
    }

    /**
     * Mengupdate buku yang ada.
     * (Akan kita isi nanti saat membuat fitur Admin)
     */
    public function update(Request $request, Book $book)
    {
        // Logika untuk mengupdate buku akan ada di sini
    }

    /**
     * Menghapus buku.
     * (Akan kita isi nanti saat membuat fitur Admin)
     */
    public function destroy(Book $book)
    {
        // Logika untuk menghapus buku akan ada di sini
    }
}

