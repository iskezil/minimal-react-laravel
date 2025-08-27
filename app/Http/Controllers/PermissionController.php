<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(): Response
    {
        syncLangFiles(['auth', 'navbar', 'navigation', 'pages/permissions']);

        $permissions = Permission::select('id', 'name', 'created_at')
            ->get()
            ->map(fn ($permission) => [
                'id' => $permission->id,
                'name' => $permission->name,
                'created_at' => $permission->created_at->toDateString(),
            ]);

        return Inertia::render('dashboard/permissions', [
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('permissions', 'name')],
        ]);

        Permission::create(['name' => $validated['name']]);

        return back();
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        $permission->delete();
        return back();
    }
}
