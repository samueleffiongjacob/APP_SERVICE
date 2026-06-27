package com.example.serviceplatform.domain;

import java.time.Instant;

public record AppUser(String id, String name, String email, String phone, Instant createdAt) {}
