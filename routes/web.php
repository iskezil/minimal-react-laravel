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
    ->name('users.index');
  Route::patch('/users/{user}', [UserController::class, 'update'])
    ->name('users.update');
  Route::delete('/users/{user}', [UserController::class, 'destroy'])
    ->name('users.destroy');

  Route::get('/roles', [RoleController::class, 'index'])
    ->name('roles.index');
  Route::post('/roles', [RoleController::class, 'store'])
    ->name('roles.store');
  Route::patch('/roles/{role}', [RoleController::class, 'update'])
    ->name('roles.update');
  Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
    ->name('roles.destroy');

  Route::get('/permissions', [PermissionController::class, 'index'])
    ->name('permissions.index');
  Route::post('/permissions', [PermissionController::class, 'store'])
    ->name('permissions.store');
  Route::patch('/permissions/{permission}', [PermissionController::class, 'update'])
    ->name('permissions.update');
  Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])
    ->name('permissions.destroy');
});



require __DIR__.'/auth.php';
