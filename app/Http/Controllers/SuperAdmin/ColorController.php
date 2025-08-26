<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ColorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $query = Color::query();
        $colors = $query->orderBy('id', 'DESC')->paginate($perPage)->withQueryString();
        return Inertia::render('super-admin/color/index', [
            'colors' => $colors
        ]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:25',
            'hexCode' => [
                'required',
                'string',
                'regex:/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/'
            ],
            'color_type' => 'required|in:protection,leather',
        ]);

        Color::create([
            'name' => $validated['name'],
            'hexCode' => $validated['hexCode'],
            'color_type' => $validated['color_type']
        ]);

        return redirect()->back()->with('success', 'Color created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:25',
            'hexCode' => [
                'required',
                'string',
                'regex:/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/'
            ],
        ]);

        $color = Color::findOrFail($id);

        $color->update([
            'name' => $validated['name'],
            'hexCode' => $validated['hexCode'],
        ]);

        return redirect()->back()->with('success', 'Color updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = Color::findOrFail($id);

        $category->delete();

        return redirect()->route('color.index')->with('success', 'Color deleted successfully!');
    }

    public function updateColor(Request $request, string $id)
    {
        $validated = $request->validate([
            'color_type' => 'required|in:protection,leather',
        ]);

        $color = Color::findOrFail($id);

        $color->update([
            'color_type' => $validated['color_type']
        ]);

        return redirect()->back()->with('success', 'Color type update to ' . $validated['color_type'] . ' successfully!');
    }
}
