<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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

            return Inertia::render('dashboard/users/list', [
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
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif', 'max:3072'],
            'status' => ['required', Rule::in(['active', 'pending'])],
            'email_verified_at' => ['nullable', 'date'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ]);

        $avatarPath = $request->file('avatar')?->store('avatars', 'public');

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'avatar' => $avatarPath,
            'status' => $validated['status'],
            'email_verified_at' => $validated['email_verified_at'] ?? null,
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
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                'status' => $user->status,
                'roles' => $user->roles->pluck('id')->toArray(),
                'email_verified_at' => $user->email_verified_at,
            ],
            'roles' => Role::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif', 'max:3072'],
            'status' => ['sometimes', Rule::in(['active', 'pending', 'banned'])],
            'email_verified_at' => ['nullable', 'date'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (isset($validated['password'])) {
            $user->password = $validated['password'];
        }

        if (isset($validated['status'])) {
            $user->status = $validated['status'];
        }

        if (array_key_exists('email_verified_at', $validated)) {
            $user->email_verified_at = $validated['email_verified_at'];
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }

        if (
            isset($validated['name']) ||
            isset($validated['email']) ||
            isset($validated['password']) ||
            isset($validated['status']) ||
            array_key_exists('email_verified_at', $validated) ||
            $request->hasFile('avatar')
        ) {
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
