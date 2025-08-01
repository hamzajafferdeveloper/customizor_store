<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Store;
use Illuminate\Support\Facades\Storage;
use App\Models\Font;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FontController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $query = Font::query();
        $fonts = $query->orderBy('id', 'DESC')->paginate($perPage)->withQueryString();
        $plans = Plan::get(['id', 'name']);
        return Inertia::render('super-admin/font/index', [
            'fonts' => $fonts,
            'plans' => $plans
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        if ($request->hasFile('source')) {
            $file = $request->file('source');
            $filename = time() . '-' . $file->getClientOriginalName();
            $fontfile_name = $file->storeAs('font', $filename, 'public');
        }

        Font::create([
            'name' => $request->name,
            'path' => $fontfile_name
        ]);

        return redirect()->route('superadmin.fonts.index')->with('success', 'Font created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $font = Font::findOrFail($id);

        // Prepare data for update
        $updateData = ['name' => $request->name];

        // If a new font file is uploaded
        if ($request->hasFile('source')) {
            $file = $request->file('source');
            $filename = time() . '-' . $file->getClientOriginalName();
            $newFilePath = $file->storeAs('font', $filename, 'public');

            // ✅ Delete old font file if it exists
            if ($font->path && Storage::disk('public')->exists($font->path)) {
                Storage::disk('public')->delete($font->path);
            }

            // Add new file path to update data
            $updateData['path'] = $newFilePath;
        }

        // Update font record
        $font->update($updateData);

        return redirect()->route('superadmin.fonts.index')->with('success', 'Font updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $font = Font::findOrFail($id);

        // ✅ Delete font file if exists
        if ($font->path && Storage::disk('public')->exists($font->path)) {
            Storage::disk('public')->delete($font->path);
        }

        // ✅ Delete record
        $font->delete();

        return redirect()->route('superadmin.fonts.index')->with('success', 'Font deleted successfully!');
    }

    public function assignPlans(Request $request, Font $font)
    {
        $validated = $request->validate([
            'plan_ids' => 'array',
            'plan_ids.*' => 'exists:plans,id'
        ]);

        $font->plans()->sync($validated['plan_ids'] ?? []);

        return back()->with('success', 'Plans assigned to font successfully.');
    }
}
