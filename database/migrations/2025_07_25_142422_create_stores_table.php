<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Store name
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Owner
            $table->string('plan_id'); // Plan
            $table->foreignId('payment_detail_id')->nullable()->constrained()->onDelete('set null'); // Payment details
            $table->string('email')->unique(); // Contact email
            $table->string('country')->nullable();
            $table->string('phone')->nullable();
            $table->string('logo')->nullable(); // Store logo
            $table->enum('type', ['protected', 'public'])->default('protected'); // Access control
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active'); // Store status
            $table->string('bio')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store');
    }
};
