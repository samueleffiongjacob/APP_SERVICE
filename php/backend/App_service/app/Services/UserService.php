<?php

namespace App\Services;

use App\Repositories\UserRepository;

class UserService
{
    public function __construct(private UserRepository $users) {}

    public function all(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->users->all();
    }

    public function delete(string $id): bool
    {
        return $this->users->delete($id);
    }
}
