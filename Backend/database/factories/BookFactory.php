<?php

namespace Database\Factories;

use App\Models\Publisher; // <-- Tambahkan ini
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
            // Ini akan mengambil ID dari Publisher yang sudah ada
            'publisher_id' => Publisher::factory(), 

            'title' => $this->faker->sentence(4),
            'isbn' => $this->faker->unique()->isbn13(),
            'description' => $this->faker->paragraph(3),

            // Harga antara 50rb - 300rb
            'price' => $this->faker->numberBetween(50000, 300000), 
            'stock' => $this->faker->numberBetween(0, 100),

            // 'cover_image' sudah ada di migrasi Anda
            'cover_image' => $this->faker->imageUrl(480, 640, 'book', true),

            'year_published' => $this->faker->year(),
        ];
    }
}