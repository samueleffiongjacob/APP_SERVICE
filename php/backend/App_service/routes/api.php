<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn() => response()->json(['status' => 'ok']));

Route::prefix('auth')->group(function () {
    Route::post('/signup', [AuthController::class, 'signup']);
    Route::post('/login',  [AuthController::class, 'login']);
});

Route::apiResource('users', UserController::class)->only(['index', 'destroy']);
Route::apiResource('requests', LeadController::class)->only(['index', 'store', 'destroy']);