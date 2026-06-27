<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function all(): \Illuminate\Database\Eloquent\Collection
    {
        return User::all();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function delete(string $id): bool
    {
        $user = User::find($id);
        if (!$user) return false;
        $user->delete();
        return true;
    }

    public function emailExists(string $email): bool
    {
        return User::where('email', $email)->exists();
    }
}
