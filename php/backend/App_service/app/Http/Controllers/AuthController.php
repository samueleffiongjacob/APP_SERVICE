<?php

namespace App\Http\Controllers;

use App\DTOs\LoginDTO;
use App\DTOs\SignupDTO;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function signup(SignupRequest $request): JsonResponse
    {
        $result = $this->auth->signup(SignupDTO::fromRequest($request->validated()));

        return $result['success']
            ? response()->json($result['user'], 201)
            : response()->json(['error' => $result['message']], 400);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login(LoginDTO::fromRequest($request->validated()));

        return $result['success']
            ? response()->json(['token' => $result['token'], 'user' => $result['user']])
            : response()->json(['error' => $result['message']], 401);
    }
}