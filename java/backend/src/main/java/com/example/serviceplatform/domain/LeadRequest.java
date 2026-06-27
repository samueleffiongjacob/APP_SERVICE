package com.example.serviceplatform.domain;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public record LeadRequest(
    String id,
    @NotBlank String name,
    @Email @NotBlank String email,
    @NotBlank String phone,
    @NotBlank String service,
    @NotBlank String message,
    Instant createdAt) {}
