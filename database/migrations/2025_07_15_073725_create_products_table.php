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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image');
            $table->string('sku');
            $table->string('slug')->unique();
            $table->enum('type', ['simple', 'starter', 'pro', 'ultra'])->default('simple');
            $table->json('sizes')->nullable();
            $table->json('materials')->nullable();
            $table->foreignId('categories_id')->constrained()->onDelete('Cascade');
            $table->boolean('is_paid')->default(false);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User association
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
