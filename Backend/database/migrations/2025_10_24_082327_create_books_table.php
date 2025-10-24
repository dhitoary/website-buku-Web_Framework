<?php
// File: Backend/database/migrations/...._create_books_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id(); // PK
            
            // Relasi (FK)
            $table->foreignId('publisher_id')->nullable()->constrained('publishers')->onDelete('restrict');
            
            $table->string('title');
            $table->string('isbn')->unique()->nullable();
            $table->text('description')->nullable();
            $table->integer('page_count')->nullable()->unsigned();
            $table->integer('published_year')->nullable();
            
            // Kolom E-commerce
            $table->decimal('price', 12, 2)->default(0.00);
            $table->integer('stock')->default(0);
            
            $table->string('cover_image_url')->nullable();
            
            $table->timestamps(); // created_at dan updated_at
            $table->softDeletes(); // deleted_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};