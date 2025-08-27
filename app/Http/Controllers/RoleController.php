<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        syncLangFiles(['auth', 'navbar', 'navigation', 'pages/roles']);

        $roles = Role::select('id', 'name', 'created_at')
            ->get()
            ->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'created_at' => $role->created_at->toDateString(),
            ]);

        return Inertia::render('dashboard/roles', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')],
        ]);

        Role::create(['name' => $validated['name']]);

        return back();
    }

    public function destroy(Role $role): RedirectResponse
    {
        $role->delete();
        return back();
    }
}
