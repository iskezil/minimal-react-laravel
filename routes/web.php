<?php

use App\Http\Controllers\Core\LocalisationsController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::patch('/locale', [LocalisationsController::class, 'update'])->name('locale.update');

Route::middleware('auth')->group(function () {
  Route::get('/', function () {
    return Inertia::render('index');
  });

  Route::get('/dashboard', function () {
    syncLangFiles(['auth', 'navbar', 'navigation', 'pages/home']);
    return Inertia::render('dashboard/home');
  });

  Route::get('/users', [UserController::class, 'index'])
    ->middleware('permission:USERS_VIEW')
    ->name('users.index');
  Route::get('/users/create', [UserController::class, 'create'])
    ->middleware('permission:USERS_CREATE')
    ->name('users.create');
  Route::post('/users', [UserController::class, 'store'])
    ->middleware('permission:USERS_CREATE')
    ->name('users.store');
  Route::get('/users/{user}/edit', [UserController::class, 'edit'])
    ->middleware('permission:USERS_EDIT')
    ->name('users.edit');
  Route::get('/users/{user}/edit/change-password', [UserController::class, 'edit'])
    ->middleware('permission:USERS_EDIT')
    ->name('users.edit.password');
  Route::patch('/users/{user}', [UserController::class, 'update'])
    ->middleware('permission:USERS_EDIT')
    ->name('users.update');
  Route::delete('/users/{user}', [UserController::class, 'destroy'])
    ->middleware('permission:USERS_DELETE')
    ->name('users.destroy');

  Route::get('/roles', [RoleController::class, 'index'])
    ->middleware('permission:ROLES_VIEW')
    ->name('roles.index');
  Route::post('/roles', [RoleController::class, 'store'])
    ->middleware('permission:ROLES_CREATE')
    ->name('roles.store');
  Route::patch('/roles/{role}', [RoleController::class, 'update'])
    ->middleware('permission:ROLES_EDIT')
    ->name('roles.update');
  Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
    ->middleware('permission:ROLES_DELETE')
    ->name('roles.destroy');

  Route::get('/permissions', [PermissionController::class, 'index'])
    ->middleware('permission:PERMISSIONS_VIEW')
    ->name('permissions.index');
  Route::post('/permissions', [PermissionController::class, 'store'])
    ->middleware('permission:PERMISSIONS_CREATE')
    ->name('permissions.store');
  Route::patch('/permissions/{permission}', [PermissionController::class, 'update'])
    ->middleware('permission:PERMISSIONS_EDIT')
    ->name('permissions.update');
  Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])
    ->middleware('permission:PERMISSIONS_DELETE')
    ->name('permissions.destroy');
});



require __DIR__.'/auth.php';
