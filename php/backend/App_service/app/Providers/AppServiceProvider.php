<?php

namespace App\Providers;

use App\Repositories\LeadRepository;
use App\Repositories\UserRepository;
use App\Services\AuthService;
use App\Services\LeadService;
use App\Services\UserService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register your services and repositories here
        $this->app->bind(UserRepository::class, UserRepository::class);
        $this->app->bind(LeadRepository::class, LeadRepository::class);
        $this->app->bind(AuthService::class, AuthService::class);
        $this->app->bind(UserService::class, UserService::class);
        $this->app->bind(LeadService::class, LeadService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
