<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
// Tambahkan ini untuk validasi
use Illuminate\Support\Facades\Validator;
// Tambahkan ini untuk mendapatkan user yang login
use Illuminate\Support\Facades\Auth;
// Tambahkan ini untuk response error otorisasi
use Illuminate\Auth\Access\AuthorizationException;


class BookController extends Controller
{
    /**
     * Menampilkan daftar semua buku dengan pagination.
     */
    public function index()
    {
        // Ambil buku, urutkan dari terbaru, paginasi 10 per halaman
        $books = Book::latest()->paginate(10);
        return response()->json($books);
    }

    /**
     * Menyimpan buku baru ke database.
     */
    public function store(Request $request)
    {
        // 1. Validasi Input dari request
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'required|string|max:255',
            'year_published' => 'required|integer|digits:4',
            'description' => 'nullable|string',
            'cover_image_url' => 'nullable|url', // Memastikan format URL benar
        ]);

        // Jika validasi gagal, kembalikan response error
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422); // 422 Unprocessable Entity
        }

        // 2. Dapatkan user yang sedang login via token Sanctum
        $user = Auth::user(); // Atau bisa juga $request->user() jika middleware sudah aktif
        if (!$user) {
             // Jika tidak ada user login (token tidak valid/tidak ada)
             return response()->json(['message' => 'Unauthenticated.'], 401); // 401 Unauthorized
        }

        // 3. Buat buku baru dan otomatis hubungkan dengan user yang login
        // $validator->validated() hanya mengambil data yang sudah lolos validasi
        $book = $user->books()->create($validator->validated());

        // 4. Kembalikan response sukses
        return response()->json([
            'message' => 'Book created successfully',
            'book' => $book // Kirim data buku yang baru dibuat
        ], 201); // 201 Created
    }

    /**
     * Menampilkan satu buku spesifik berdasarkan ID-nya.
     */
    public function show(Book $book)
    {
        // Laravel's Route Model Binding otomatis menemukan buku berdasarkan ID
        return response()->json($book);
    }

    /**
     * Mengupdate buku yang ada.
     */
    public function update(Request $request, Book $book)
    {
        // 1. Dapatkan user yang sedang login
        $user = Auth::user();
         if (!$user) {
             return response()->json(['message' => 'Unauthenticated.'], 401);
         }

        // 2. Cek Otorisasi (Apakah user ini pemilik buku?)
        if ($user->id !== $book->user_id) {
             // Jika bukan pemilik, lempar error 403 Forbidden
             throw new AuthorizationException('You do not own this book.');
             // Atau bisa juga: return response()->json(['message' => 'Forbidden. You do not own this book.'], 403);
        }

        // 3. Validasi input (mirip store, tapi tidak semua wajib)
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255', // 'sometimes' berarti hanya validasi jika ada di request
            'author' => 'sometimes|required|string|max:255',
            'publisher' => 'sometimes|required|string|max:255',
            'year_published' => 'sometimes|required|integer|digits:4',
            'description' => 'nullable|string',
            'cover_image_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 4. Update data buku
        $book->update($validator->validated());

        // 5. Kembalikan response sukses dengan data buku yang sudah diupdate
        return response()->json([
            'message' => 'Book updated successfully',
            'book' => $book
        ]);
    }

    /**
     * Menghapus buku.
     */
    public function destroy(Book $book)
    {
        // 1. Dapatkan user yang sedang login
        $user = Auth::user();
         if (!$user) {
             return response()->json(['message' => 'Unauthenticated.'], 401);
         }

        // 2. Cek Otorisasi (Apakah user ini pemilik buku?)
        if ($user->id !== $book->user_id) {
            throw new AuthorizationException('You do not own this book.');
             // Atau: return response()->json(['message' => 'Forbidden. You do not own this book.'], 403);
        }

        // 3. Hapus buku
        $book->delete();

        // 4. Kembalikan response sukses (biasanya 204 No Content untuk delete)
        return response()->json(['message' => 'Book deleted successfully'], 200);
        // Atau: return response()->noContent(); // Standar REST API untuk delete sukses
    }
}

