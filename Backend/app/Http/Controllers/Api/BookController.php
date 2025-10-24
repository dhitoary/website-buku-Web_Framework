<?php
// File: Backend/app/Http/Controllers/Api/BookController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response; 
use Illuminate\Support\Facades\DB; 

class BookController extends Controller
{
    /**
     * INI FUNGSI YANG SUDAH KITA MODIFIKASI (Tahap 8.6)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Book::with(['publisher', 'authors', 'categories']);

        // Blok pencarian judul
        if ($request->has('search') && $request->search != '') {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Blok filter kategori
        if ($request->has('category_id') && $request->category_id != '') {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('id', $request->category_id);
            });
        }
        
        $books = $query->paginate(15); 
        return BookResource::collection($books);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): BookResource
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'publisher_id' => 'nullable|exists:publishers,id',
            'isbn' => 'nullable|string|unique:books,isbn',
            'description' => 'nullable|string',
            'page_count' => 'nullable|integer|min:0',
            'published_year' => 'nullable|integer',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'cover_image_url' => 'nullable|url',
            'author_ids' => 'nullable|array',
            'author_ids.*' => 'integer|exists:authors,id', 
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);

        $book = DB::transaction(function () use ($validated) {
            $newBook = Book::create($validated);

            if (!empty($validated['author_ids'])) {
                $newBook->authors()->sync($validated['author_ids']);
            }
            if (!empty($validated['category_ids'])) {
                $newBook->categories()->sync($validated['category_ids']);
            }
            return $newBook;
        });

        $book->load(['publisher', 'authors', 'categories']);
        return BookResource::make($book);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): BookResource
    {
        $book = Book::with(['publisher', 'authors', 'categories'])
                    ->findOrFail($id); 

        return BookResource::make($book);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): BookResource
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'publisher_id' => 'sometimes|nullable|exists:publishers,id',
            'isbn' => 'sometimes|nullable|string|unique:books,isbn,' . $book->id,
            'description' => 'sometimes|nullable|string',
            'page_count' => 'sometimes|nullable|integer|min:0',
            'published_year' => 'sometimes|nullable|integer',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'cover_image_url' => 'sometimes|nullable|url',
            'author_ids' => 'sometimes|nullable|array',
            'author_ids.*' => 'integer|exists:authors,id',
            'category_ids' => 'sometimes|nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);

        DB::transaction(function () use ($book, $validated, $request) {
            $book->update($validated);

            if ($request->has('author_ids')) { 
                $book->authors()->sync($validated['author_ids'] ?? []); 
            }
            if ($request->has('category_ids')) {
                $book->categories()->sync($validated['category_ids'] ?? []);
            }
        });

        $book->load(['publisher', 'authors', 'categories']);
        return BookResource::make($book);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): Response
    {
        $book = Book::findOrFail($id);
        $book->delete();
        return response()->noContent();
    }
}