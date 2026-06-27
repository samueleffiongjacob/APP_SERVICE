<?php

namespace App\Http\Controllers;

use App\DTOs\LeadDTO;
use App\Http\Requests\LeadRequest;
use App\Services\LeadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class LeadController extends Controller
{
    public function __construct(private LeadService $leads) {}

    public function store(LeadRequest $request): JsonResponse
    {
        $lead = $this->leads->submit(LeadDTO::fromRequest($request->validated()));
        return response()->json($lead, 201);
    }

    public function index(): JsonResponse
    {
        return response()->json($this->leads->all());
    }

    public function destroy(string $id): JsonResponse|Response
    {
        try{
            return $this->leads->delete($id)
            ? response()->noContent()
            : response()->json(['error' => 'Lead not found'], 404);
        }catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while deleting the lead' . $e->getMessage()], 500);
        }
    }
}