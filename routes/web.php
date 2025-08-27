<?php

use App\Http\Controllers\Core\LocalisationsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
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
    ->name('users.index')
    ->middleware('role:admin');

  Route::patch('/users/{user}', [UserController::class, 'update'])
    ->name('users.update')
    ->middleware('role:admin');

  Route::delete('/users/{user}', [UserController::class, 'destroy'])
    ->name('users.destroy')
    ->middleware('role:admin');

  Route::get('/roles', [RoleController::class, 'index'])
    ->name('roles.index')
    ->middleware('role:admin');
  Route::post('/roles', [RoleController::class, 'store'])
    ->name('roles.store')
    ->middleware('role:admin');
  Route::patch('/roles/{role}', [RoleController::class, 'update'])
    ->name('roles.update')
    ->middleware('role:admin');
  Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
    ->name('roles.destroy')
    ->middleware('role:admin');

  Route::get('/permissions', [PermissionController::class, 'index'])
    ->name('permissions.index')
    ->middleware('role:admin');
  Route::post('/permissions', [PermissionController::class, 'store'])
    ->name('permissions.store')
    ->middleware('role:admin');
  Route::patch('/permissions/{permission}', [PermissionController::class, 'update'])
    ->name('permissions.update')
    ->middleware('role:admin');
  Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])
    ->name('permissions.destroy')
    ->middleware('role:admin');
});



require __DIR__.'/auth.php';
