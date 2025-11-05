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
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('type');
            $table->foreignId('product_type_id')->after('slug')->nullable()->constrained('product_types')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('your_table_name', function (Blueprint $table) {
            // Rollback logic
            $table->dropForeign(['type_id']);
            $table->dropColumn('type');

            $table->enum('type', ['simple', 'starter', 'pro', 'ultra'])->default('simple');
        });
    }
};
