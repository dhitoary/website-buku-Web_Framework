<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * Mendefinisikan status default dari model.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Kolom 'user_id' akan kita tentukan saat memanggil factory nanti.
            
            // faker->sentence(3) akan membuat judul acak dari 3 kata.
            'title' => $this->faker->sentence(3),
            
            // faker->name() akan menghasilkan nama orang acak.
            'author' => $this->faker->name(),
            
            // faker->company() akan menghasilkan nama perusahaan acak.
            'publisher' => $this->faker->company(),
            
            // faker->year() akan menghasilkan tahun acak.
            'year_published' => $this->faker->year(),
            
            // faker->paragraph(2) akan membuat deskripsi acak dari 2 paragraf.
            'description' => $this->faker->paragraph(2),
            
            // faker->imageUrl(...) akan menghasilkan link URL ke sebuah gambar acak.
            'cover_image_url' => $this->faker->imageUrl(480, 640, 'book', true),
        ];
    }
}
