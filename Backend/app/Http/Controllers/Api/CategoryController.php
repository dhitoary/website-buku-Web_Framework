<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Mengembalikan daftar semua kategori.
     * GET /api/categories
     */
    public function index()
    {
        $categories = Category::orderBy('name', 'asc')->get();
        return CategoryResource::collection($categories);
    }
}