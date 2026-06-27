<?php

namespace App\Services;

use App\DTOs\LoginDTO;
use App\DTOs\SignupDTO;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private UserRepository $users) {}

    public function signup(SignupDTO $dto): array
    {
        if ($this->users->emailExists($dto->email)) {
            return ['success' => false, 'message' => 'User already exists'];
        }

        if (strlen($dto->password) < 10) {
        return [
            'success' => false,
            'message' => 'Password is too weak. It must be at least 10 characters. Example: MyPass@2024'
            ];
        }

        $user = $this->users->create([
            'name'     => $dto->name,
            'email'    => $dto->email,
            'phone'    => $dto->phone,
            'password' => Hash::make($dto->password),
        ]);

        return ['success' => true, 'user' => $user];
    }

    public function login(LoginDTO $dto): array
    {
        $user = $this->users->findByEmail($dto->email);

        if (!$user || !Hash::check($dto->password, $user->password)) {
            return ['success' => false, 'message' => 'Invalid credentials'];
        }

        $token = bin2hex(random_bytes(32));
        return ['success' => true, 'token' => $token, 'user' => $user];
    }
}
