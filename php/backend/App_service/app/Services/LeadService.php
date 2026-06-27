<?php

namespace App\Services;

use App\DTOs\LeadDTO;
use App\Models\Lead;
use App\Repositories\LeadRepository;

class LeadService
{
    public function __construct(private LeadRepository $leads) {}

    public function submit(LeadDTO $dto): Lead
    {
        return $this->leads->create([
            'name'    => $dto->name,
            'email'   => $dto->email,
            'phone'   => $dto->phone,
            'service' => $dto->service,
            'message' => $dto->message,
        ]);
    }

    public function all(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->leads->all();
    }

    public function delete(string $id): bool
    {
        return $this->leads->delete($id);
    }
}
