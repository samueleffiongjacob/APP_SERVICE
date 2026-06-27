package com.example.serviceplatform.repository;

import com.example.serviceplatform.domain.AppUser;
import com.example.serviceplatform.domain.LeadRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryStore {
  private final Map<String, AppUser> users = new ConcurrentHashMap<>();
  private final Map<String, String> passwords = new ConcurrentHashMap<>();
  private final List<LeadRequest> requests = new ArrayList<>();

  public LeadRequest saveRequest(LeadRequest request) {
    requests.add(request);
    return request;
  }

  public AppUser saveUser(AppUser user, String password) {
    users.put(user.id(), user);
    passwords.put(user.email(), password);
    return user;
  }

  public AppUser findByEmail(String email) {
    return users.values().stream().filter(user -> user.email().equalsIgnoreCase(email)).findFirst().orElse(null);
  }

  public boolean matchesPassword(String email, String password) {
    return password.equals(passwords.get(email));
  }

  public List<AppUser> users() {
    return List.copyOf(users.values());
  }

  public void deleteUser(String id) {
    AppUser user = users.remove(id);
    if (user != null) {
      passwords.remove(user.email());
    }
  }
}
