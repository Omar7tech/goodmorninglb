<?php

use App\Enums\OrderType;
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
            $table->string('subtitle')->nullable()->after('slug');
            $table->unsignedSmallInteger('preparation_time')->nullable()->after('description');
            // Nullable rather than defaulted: a dessert nobody has counted is
            // not a zero-calorie dessert, and the storefront hides the figure
            // entirely rather than printing one the kitchen never gave.
            $table->unsignedSmallInteger('calories')->nullable()->after('preparation_time');
            $table->decimal('discount_price', 8, 2)->nullable()->after('price');
            $table->string('order_type')->default(OrderType::Both->value)->after('discount_price');
            // What is in the dessert, in the order the kitchen lists it. A
            // column of its own rather than more prose in `description`, so a
            // customer can take something out of it before ordering.
            $table->json('ingredients')->nullable()->after('variants');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'subtitle',
                'preparation_time',
                'calories',
                'discount_price',
                'order_type',
                'ingredients',
            ]);
        });
    }
};
