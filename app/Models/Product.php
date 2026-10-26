<?php

namespace App\Models;

use App\Enums\OrderType;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\Attributes\Sluggable;

/**
 * The JSON columns are typed as what the admin repeaters write, with every key
 * optional: a column holds whatever was last saved to it, so its readers treat
 * a missing name or price as something that can happen.
 *
 * @property array<int, array{name?: string|null, price?: float|int|string|null, discount_price?: float|int|string|null}>|null $variants
 * @property array<int, mixed>|null $ingredients
 */
#[Sluggable(from: 'title', to: 'slug')]
#[Guarded(['id'])]
class Product extends Model implements HasMedia
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, InteractsWithMedia;

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')
            ->singleFile()
            ->useDisk('public');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('webp')
            ->nonQueued()
            ->format('webp')
            ->quality(75);

        $this->addMediaConversion('thumb')
            ->nonQueued()
            ->format('webp')
            ->quality(50)
            ->fit(Fit::Max, 400, 400);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_new' => 'boolean',
            'price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'order_type' => OrderType::class,
            'preparation_time' => 'integer',
            'calories' => 'integer',
            'ingredients' => 'array',
            'sort_order' => 'integer',
            'variants' => 'array',
        ];
    }
}
