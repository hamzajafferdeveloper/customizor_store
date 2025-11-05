<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Cache;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        try {
            $settings = Setting::pluck('value', 'key')->toArray();

            return Inertia::render('super-admin/settings', [
                'settings' => $settings,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors('error', 'Failed To get settings');
        }
    }

    public function update(Request $request)
    {
        try {
            $request->validate([
                // 'currency' => 'required|string|max:10',
                'title' => 'required|string|max:255',
                'logo' => 'nullable|image|max:2048',
            ]);

            $logoPath = null;
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('logos', 'public');
                Setting::updateOrCreate(['key' => 'logo'], ['value' => $logoPath]);
            }

            Setting::updateOrCreate(
                ['key' => 'title'],
                ['value' => $request->title]
            );

            // Setting::updateOrCreate(
            //     ['key' => 'currency'],
            //     ['value' => $request->currency]
            // );

            // Clear and refresh settings cache
            Cache::forget('site_settings');
            Cache::rememberForever('site_settings', function () {
                return Setting::pluck('value', 'key')->toArray();
            });

            return back()->with('success', 'Settings updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors('error', 'Failed To update settings');
        }
    }
}
