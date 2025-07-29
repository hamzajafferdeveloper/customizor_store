<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ColorSeeder extends Seeder
{
    public function run(): void
    {
        $colors = [
            ['name' => 'Red', 'hexCode' => '#FF0000'],
            ['name' => 'Blue', 'hexCode' => '#0000FF'],
            ['name' => 'Black', 'hexCode' => '#000'],
            ['name' => 'White', 'hexCode' => '#ffffff'],
            ['name' => 'Orange', 'hexCode' => '#FF8C00'],
            ['name' => 'KTM Orange', 'hexCode' => '#E76325'],
            ['name' => 'Royal blue', 'hexCode' => '#120D8E'],
            ['name' => 'Suzuki Blue', 'hexCode' => '#1D47D1'],
            ['name' => 'Baby/Sky Blue', 'hexCode' => '#89CFF0'],
            ['name' => 'Fluorescent Blue', 'hexCode' => '#02B2FE'],
            ['name' => 'Kawasaki/Forest Green', 'hexCode' => '#006400'],
            ['name' => 'Green', 'hexCode' => '#099535'],
            ['name' => 'Fluorescent Green', 'hexCode' => '#5EFF41'],
            ['name' => 'Lemon fluor', 'hexCode' => '#D1E52C'],
            ['name' => 'Yellow Fluorescent', 'hexCode' => '#E1FF00'],
            ['name' => 'Shiny Gold', 'hexCode' => '#C5A337'],
            ['name' => 'DHL Yellow', 'hexCode' => '#FEC311'],
            ['name' => 'Dark Grey', 'hexCode' => '#262E30'],
            ['name' => 'Regular Grey', 'hexCode' => '#52555A'],
            ['name' => 'Silver Grey', 'hexCode' => '#808080'],
            ['name' => 'Silver', 'hexCode' => '#D3D3D3'],
            ['name' => 'Majinda', 'hexCode' => '#832540'],
            ['name' => 'Purple Light', 'hexCode' => '#9400D3'],
            ['name' => 'Purple', 'hexCode' => '#3D294E'],
            ['name' => 'Pink Fluore', 'hexCode' => '#FF0080'],
            ['name' => 'Orange Fluorescent', 'hexCode' => '#FE4502'],
            ['name' => 'Red Fluorescent', 'hexCode' => '#ED1B24'],
        ];

        DB::table('colors')->insert($colors);
    }
}
