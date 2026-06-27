package com.example.serviceplatform.api;

import com.example.serviceplatform.domain.AppUser;
import com.example.serviceplatform.domain.AuthResponse;
import com.example.serviceplatform.domain.LeadRequest;
import com.example.serviceplatform.domain.LoginRequest;
import com.example.serviceplatform.domain.SignupRequest;
import com.example.serviceplatform.service.AppService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AppController {
  private final AppService service;

  public AppController(AppService service) {
    this.service = service;
  }

  @GetMapping("/health")
  public java.util.Map<String, String> health() {
    return java.util.Map.of("status", "ok");
  }

  @PostMapping("/requests")
  @ResponseStatus(HttpStatus.CREATED)
  public LeadRequest createRequest(@Valid @RequestBody LeadRequest payload) {
    return service.createRequest(payload);
  }

   @GetMapping("/requests")
  public List<LeadRequest> requests() {
    return service.requests();
  }

  @DeleteMapping("/requests/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteRequest(@PathVariable String id) {
    service.deleteRequest(id);
  }
  
  @PostMapping("/auth/signup")
  @ResponseStatus(HttpStatus.CREATED)
  public AppUser signup(@Valid @RequestBody SignupRequest payload) {
    return service.signup(payload);
  }

  @PostMapping("/auth/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest payload) {
    return service.login(payload);
  }

  @GetMapping("/users")
  public List<AppUser> users() {
    return service.users();
  }

  @DeleteMapping("/users/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteUser(@PathVariable String id) {
    service.deleteUser(id);
  }
}
