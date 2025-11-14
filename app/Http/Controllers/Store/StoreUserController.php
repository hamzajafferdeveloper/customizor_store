<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Mail\UserAddedToStore;
use App\Models\Store;
use App\Models\StoreUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class StoreUserController extends Controller
{
    public function AllUsers(Request $request, $storeSlug)
    {
        // Optional search query
        $search = $request->input('search');

        // Base query: only get users attached to the given store
        $users = User::query();

        // Apply search filter if provided
        if (! empty($search)) {
            $users->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Fetch results (you can paginate if needed)
        $users = $users->select('id', 'name', 'email') // Select only needed columns
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'users' => $users,
            'message' => 'Users fetched successfully',
        ], 200);
    }

    public function storeUsers($storeSlug)
    {
        try {
            $store = Store::where('slug', $storeSlug)->first();
            $users = StoreUser::where('store_id', $store->id)
                ->with('user')
                ->get()
                ->pluck('user');

            return response()->json([
                'users' => $users,
                'message' => 'Users fetched successfully',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function addUserToStore($storeSlug, $userId)
    {
        try {
            $store = Store::where('slug', $storeSlug)->first();

            StoreUser::create([
                'store_id' => $store->id,
                'user_id' => $userId,
            ]);

            $password = base64_decode($store->store_key);

            $user = User::findOrFail($userId);

            Mail::to($user->email)->send(new UserAddedToStore($user, $password));

            return response()->json([
                'message' => 'User added to store successfully',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add user to store',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function removeUserFromStore($storeSlug, $userId)
    {
        try {
            $storeUser = StoreUser::where('store_id', $storeSlug)
                ->where('user_id', $userId)
                ->first();

            if (! $storeUser) {
                return response()->json([
                    'message' => 'User not found in the store',
                ], 404);
            }

            $storeUser->delete();

            return response()->json([
                'message' => 'User removed from store successfully',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to remove user from store',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
