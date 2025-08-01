<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Plan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $freePlan = Plan::firstOrCreate(['name' => 'Free Plan'], ['price' => 0]);

        $permissions = [
            ['key' => 'image', 'description' => 'Number of images user can upload'],
            ['key' => 'text', 'description' => 'Number of text elements allowed'],
            ['key' => 'products', 'description' => 'Number of products allowed'],
            ['key' => 'layer_color', 'description' => 'Can change layer colors'],
            ['key' => 'download_svg', 'description' => 'Can download SVG format'],
            ['key' => 'download_png', 'description' => 'Can download PNG format'],
            ['key' => 'logo_gallery_show', 'description' => 'Can see logo gallery option'],
            ['key' => 'logo_gallery', 'description' => 'Can use logo gallery'],
            ['key' => 'simple_product', 'description' => 'Can use simple product'],
            ['key' => 'starter_product', 'description' => 'Can use starter product'],
            ['key' => 'pro_product', 'description' => 'Can use pro product'],
            ['key' => 'ultra_product', 'description' => 'Can use ultra product'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['key' => $perm['key']],
                ['description' => $perm['description']]
            );
        }

        $freePlan->permissions()->sync([
            Permission::where('key', 'image')->first()->id => ['limit' => 2, 'is_enabled' => true],
            Permission::where('key', 'text')->first()->id => ['limit' => 2, 'is_enabled' => true],
            Permission::where('key', 'products')->first()->id => ['limit' => 1, 'is_enabled' => true],
            Permission::where('key', 'layer_color')->first()->id => ['is_enabled' => false],
            Permission::where('key', 'download_svg')->first()->id => ['is_enabled' => false],
            Permission::where('key', 'download_png')->first()->id => ['is_enabled' => true],
            Permission::where('key', 'logo_gallery_show')->first()->id => ['is_enabled' => true],
            Permission::where('key', 'logo_gallery')->first()->id => ['is_enabled' => false],
        ]);
    }
}
