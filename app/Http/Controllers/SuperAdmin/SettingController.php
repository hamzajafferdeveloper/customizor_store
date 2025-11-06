<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Mail\ExtraPermissionApprovedMail;
use App\Models\RequestExtraPermission;
use App\Models\Setting;
use App\Models\StoreExtraPermission;
use Cache;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Mail;

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

    public function getExtraPermissionRequest(Request $request)
    {
        try {
            $search = $request->input('search');
            $status = $request->input('status');
            $sort = $request->input('sort', 'desc');

            $requests = RequestExtraPermission::with(['store', 'permission'])
                ->when($search, function ($query, $search) {
                    $query->whereHas('store', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('id', 'like', "%{$search}%");
                    })->orWhereHas('permission', function ($q) use ($search) {
                        $q->where('key', 'like', "%{$search}%");
                    });
                })
                ->when($status, function ($query, $status) {
                    if ($status !== 'all') {
                        $query->where('status', $status);
                    }
                })
                ->orderBy('created_at', $sort)
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('super-admin/extra-permission-request', [
                'requests' => $requests,
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'sort' => $sort,
                ],
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed To get extra permission request');
        }
    }


public function approveExtraPermissionRequest(string $id)
{
    try {
        $request = RequestExtraPermission::with(['store', 'permission'])->findOrFail($id);

        $request->update(['status' => 'approved']);

        StoreExtraPermission::create([
            'store_id' => $request->store_id,
            'permission_id' => $request->permission_id,
        ]);

        // ✅ Send email to store owner
        if ($request->store && $request->store->email) {
            Mail::to($request->store->email)->send(new ExtraPermissionApprovedMail($request));
        }

        return back()->with('success', 'Extra permission request approved successfully.');
    } catch (\Exception $e) {
        return back()->with('error', 'Failed to approve extra permission request.');
    }
}
}
