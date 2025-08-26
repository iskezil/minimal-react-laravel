<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(): Response
    {
        syncLangFiles(['auth', 'navbar', 'navigation', 'pages/users']);
        $users = User::with('roles:id,name')
            ->select('id', 'name', 'email', 'status', 'created_at')
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'created_at' => $user->created_at->toDateString(),
                'roles' => $user->roles->pluck('id')->toArray(),
            ]);

        $roles = Role::select('id', 'name')->get();

        return Inertia::render('dashboard/users', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }
}
