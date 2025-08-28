<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:USERS_VIEW')->only('index');
        $this->middleware('permission:USERS_CREATE')->only(['create', 'store']);
        $this->middleware('permission:USERS_EDIT')->only(['edit', 'update']);
        $this->middleware('permission:USERS_DELETE')->only('destroy');
    }

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

    public function create(): Response
    {
        syncLangFiles(['auth', 'navbar', 'navigation', 'pages/users']);

        $roles = Role::select('id', 'name')->get();

        return Inertia::render('dashboard/users/create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        if (isset($validated['roles'])) {
            $roleNames = Role::whereIn('id', $validated['roles'])->pluck('name')->toArray();
            $user->syncRoles($roleNames);
        }

        return redirect()->route('users.index');
    }

    public function edit(User $user): Response
    {
        syncLangFiles(['auth', 'navbar', 'navigation', 'pages/users']);

        $user->load('roles:id,name');

        return Inertia::render('dashboard/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('id')->toArray(),
            ],
            'roles' => Role::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (isset($validated['name']) || isset($validated['email'])) {
            $user->save();
        }

        if (isset($validated['roles'])) {
            $roleNames = Role::whereIn('id', $validated['roles'])->pluck('name')->toArray();
            $user->syncRoles($roleNames);
        }

        return back();
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();
        return back();
    }
}
