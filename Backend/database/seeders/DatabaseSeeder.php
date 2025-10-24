<?php

namespace Database\Seeders;

// Impor semua Model yang kita butuhkan
use App\Models\User;
use App\Models\Author;
use App\Models\Category;
use App\Models\Publisher;
use App\Models\Book;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Buat 1 user 'admin' dan 9 user acak
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'is_admin' => true, // Sesuai migrasi Anda
        ]);
        User::factory(9)->create();

        // 2. Buat 20 Penulis (Author) acak
        $authors = Author::factory(20)->create();

        // 3. Buat 10 Kategori acak
        $categories = Category::factory(10)->create();

        // 4. Buat 15 Penerbit (Publisher) acak
        $publishers = Publisher::factory(15)->create();

        // 5. Buat 50 Buku
        Book::factory(50)
            ->recycle($publishers) // Gunakan ulang penerbit yang sudah ada
            ->create()
            ->each(function ($book) use ($authors, $categories) {

                // 6. Pasang 1-3 penulis acak ke setiap buku
                $book->authors()->attach(
                    $authors->random(rand(1, 3))->pluck('id')->toArray()
                );

                // 7. Pasang 1-2 kategori acak ke setiap buku
                $book->categories()->attach(
                    $categories->random(rand(1, 2))->pluck('id')->toArray()
                );
            });
    }
}