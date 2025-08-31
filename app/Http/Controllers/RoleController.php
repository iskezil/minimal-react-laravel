<?php

namespace App\Http\Controllers;

use App\Http\Resources\PermissionResource;
use App\Http\Resources\RoleResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ROLES_VIEW')->only('index');
        $this->middleware('permission:ROLES_CREATE')->only('store');
        $this->middleware('permission:ROLES_EDIT')->only('update');
        $this->middleware('permission:ROLES_DELETE')->only('destroy');
    }

    public function index(): Response
    {
        $roles = Role::with('permissions:id,name')
            ->select('id', 'name', 'created_at')
            ->get();

        $permissions = Permission::select('id', 'name')->get();

        return Inertia::render('dashboard/roles/list', [
            'roles' => RoleResource::collection($roles)->resolve(),
            'permissions' => PermissionResource::collection($permissions)->resolve(),
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

    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $permissionNames = [];
        if (isset($validated['permissions'])) {
            $permissionNames = Permission::whereIn('id', $validated['permissions'])->pluck('name')->toArray();
        }

        $role->syncPermissions($permissionNames);

        return back();
    }
}
