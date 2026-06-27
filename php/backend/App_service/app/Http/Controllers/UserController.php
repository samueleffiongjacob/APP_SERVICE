<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class UserController extends Controller
{
    public function __construct(private UserService $users) {}

    public function index(): JsonResponse
    {
        return response()->json($this->users->all());
    }

    public function destroy(string $id): JsonResponse|Response
    {
        try {
            return $this->users->delete($id)
            ? response()->noContent()
            : response()->json(['error' => 'User not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while deleting the user' . $e->getMessage()], 500);
        }
    }
}