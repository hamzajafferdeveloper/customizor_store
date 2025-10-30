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
    public function AllUsers(Request $request, $storeId)
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

    public function storeUsers($storeId)
    {
        try {
            $users = StoreUser::where('store_id', $storeId)
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

    public function addUserToStore($storeId, $userId)
    {
        try {
            StoreUser::create([
                'store_id' => $storeId,
                'user_id' => $userId,
            ]);

            $store = Store::findOrFail($storeId);
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

    public function removeUserFromStore($storeId, $userId)
    {
        try {
            $storeUser = StoreUser::where('store_id', $storeId)
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
