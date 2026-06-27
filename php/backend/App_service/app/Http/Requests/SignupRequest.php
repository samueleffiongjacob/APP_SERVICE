<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class SignupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email',
            'phone'    => 'required|string',
            'password' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'name.max'      => 'Name is too long. Maximum allowed is 255 characters.',
            'email.required'=> 'Email is required.',
            'email.email'   => 'Please provide a valid email address.',
            'phone.required'=> 'Phone number is required.',
            'password.required' => 'Password is required.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'error'  => 'Validation failed',
                'details' => $validator->errors()->first(),
            ], 422)
        );
    }
}