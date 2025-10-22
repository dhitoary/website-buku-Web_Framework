<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            // Menghubungkan ke tabel 'users' untuk nilai tambah
            $table->unsignedBigInteger('user_id')->index(); 
            
            $table->string('title');
            $table->string('author');
            $table->string('publisher');
            $table->integer('year_published');
            $table->text('description')->nullable();
            $table->string('cover_image_url')->nullable();
            
            $table->timestamps(); // Kolom created_at dan updated_at

            // Definisi Foreign Key
            // Jika user dihapus, buku-bukunya juga ikut terhapus
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};