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

class PermissionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:PERMISSIONS_VIEW')->only('index');
        $this->middleware('permission:PERMISSIONS_CREATE')->only('store');
        $this->middleware('permission:PERMISSIONS_EDIT')->only('update');
        $this->middleware('permission:PERMISSIONS_DELETE')->only('destroy');
    }

    public function index(): Response
    {
        $permissions = Permission::with('roles:id,name')
            ->select('id', 'name', 'module', 'created_at')
            ->get();

        $roles = Role::select('id', 'name')->get();

        return Inertia::render('dashboard/permissions/list', [
            'permissions' => PermissionResource::collection($permissions)->resolve(),
            'roles' => RoleResource::collection($roles)->resolve(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('permissions', 'name')],
            'module' => ['required', 'string', 'max:255'],
        ]);

        Permission::create([
            'name' => $validated['name'],
            'module' => $validated['module'],
        ]);

        return back();
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        $permission->delete();
        return back();
    }

    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $validated = $request->validate([
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ]);

        $roleNames = [];
        if (isset($validated['roles'])) {
            $roleNames = Role::whereIn('id', $validated['roles'])->pluck('name')->toArray();
        }

        $permission->syncRoles($roleNames);

        return back();
    }
}
