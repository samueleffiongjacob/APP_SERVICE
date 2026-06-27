package com.example.serviceplatform.service;

import com.example.serviceplatform.domain.AppUser;
import com.example.serviceplatform.domain.AuthResponse;
import com.example.serviceplatform.domain.LeadRequest;
import com.example.serviceplatform.domain.LoginRequest;
import com.example.serviceplatform.domain.SignupRequest;
import com.example.serviceplatform.repository.PostgresStore;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AppService {
  private final PostgresStore store;

  public AppService(PostgresStore store) {
    this.store = store;
  }

  public LeadRequest createRequest(LeadRequest payload) {
    return store.saveRequest(
        new LeadRequest(
            UUID.randomUUID().toString(),
            payload.name(),
            payload.email(),
            payload.phone(),
            payload.service(),
            payload.message(),
            Instant.now()));
  }

  public List<LeadRequest> requests() {
    return store.requests();
  }

  public void deleteRequest(String id) {
    boolean deleted = store.deleteRequest(id);
    if (!deleted) {
      throw new RequestNotFoundException(id);
    }
  }

  public AppUser signup(SignupRequest payload) {
    if (store.existsByEmail(payload.email())) {
      throw new EmailAlreadyExistsException(payload.email());
    }

    AppUser candidate =
        new AppUser(
            UUID.randomUUID().toString(),
            payload.name(),
            payload.email(),
            payload.phone(),
            Instant.now());

    // saveUser returns empty if a concurrent signup won the race on the unique
    // constraint between our existsByEmail check and this insert.
    Optional<AppUser> saved = store.saveUser(candidate, payload.password());
    return saved.orElseThrow(() -> new EmailAlreadyExistsException(payload.email()));
  }

  public AuthResponse login(LoginRequest payload) {
    AppUser user = store.findByEmail(payload.email());
    if (user == null || !store.matchesPassword(payload.email(), payload.password())) {
      throw new InvalidCredentialsException();
    }

    return new AuthResponse(UUID.randomUUID().toString(), user);
  }

  public List<AppUser> users() {
    return store.users();
  }

  public void deleteUser(String id) {
    store.deleteUser(id);
  }
}
