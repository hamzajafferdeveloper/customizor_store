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
        Schema::create('payment_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who made the payment
            $table->foreignId('plan_id')->constrained()->onDelete('cascade'); // Plan associated with the payment
            $table->decimal('amount', 10, 2); // Amount paid
            $table->enum('type', ['new', 'upgrade'])->default('new'); // Type of payment
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_detail');
    }
};
