<?php

use App\Http\Controllers\Core\LocalisationsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::patch('/locale', [LocalisationsController::class, 'update'])->name('locale.update');

Route::middleware('auth')->group(function () {
  Route::get('/', function () {
    return Inertia::render('index');
  });

  Route::get('/dashboard', function () {
    syncLangFiles(['auth', 'navbar', 'pages/home']);
    return Inertia::render('dashboard/home');
  });

  Route::get('/users', [UserController::class, 'index'])->name('users.index');
});



require __DIR__.'/auth.php';
