<?php

namespace App\Repositories;

use App\Models\Lead;

class LeadRepository
{
    public function all(): \Illuminate\Database\Eloquent\Collection
    {
        return Lead::all();
    }

    public function create(array $data): Lead
    {
        return Lead::create($data);
    }

    public function delete(string $id): bool
    {
        $lead = Lead::find($id);
        if (!$lead) return false;
        $lead->delete();
        return true;
    }
}
