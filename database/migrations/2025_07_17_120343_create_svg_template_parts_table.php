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
        Schema::create('svg_template_parts', function (Blueprint $table) {
            $table->id();
            $table->string('part_id');
            $table->foreignId('template_id')->constrained('svg_templates')->onDelete('cascade');
            $table->string('name');
            $table->string('type');
            $table->string('color');
            $table->boolean('is_group');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('svg_template_parts');
    }
};
