<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RequestLogger
{
    public function handle(Request $request, Closure $next): Response
    {
        Log::info('--> ' . $request->method() . ' ' . $request->path());

        $response = $next($request);

        Log::info('<-- ' . $response->getStatusCode());

        return $response;
    }
}