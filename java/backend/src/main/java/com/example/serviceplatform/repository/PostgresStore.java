package com.example.serviceplatform.repository;

import com.example.serviceplatform.domain.AppUser;
import com.example.serviceplatform.domain.LeadRequest;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PostgresStore {
  private final JdbcTemplate jdbc;

  public PostgresStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  // ---- requests ----

  public LeadRequest saveRequest(LeadRequest request) {
    jdbc.update(
        "INSERT INTO lead_request (id, name, email, phone, service, message, created_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?)",
        UUID.fromString(request.id()),
        request.name(),
        request.email(),
        request.phone(),
        request.service(),
        request.message(),
        Timestamp.from(request.createdAt()));
    return request;
  }

  public List<LeadRequest> requests() {
    return jdbc.query(
        "SELECT id, name, email, phone, service, message, created_at "
            + "FROM lead_request ORDER BY created_at DESC",
        (rs, rowNum) ->
            new LeadRequest(
                rs.getString("id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("phone"),
                rs.getString("service"),
                rs.getString("message"),
                rs.getTimestamp("created_at").toInstant()));
  }

  public boolean deleteRequest(String id) {
    int rows = jdbc.update("DELETE FROM lead_request WHERE id = ?", UUID.fromString(id));
    return rows > 0;
  }

  // ---- users ----

  /** Returns empty if the email is already taken; on success returns the saved user. */
  public Optional<AppUser> saveUser(AppUser user, String password) {
    try {
      jdbc.update(
          "INSERT INTO app_user (id, name, email, phone, password, created_at) "
              + "VALUES (?, ?, ?, ?, ?, ?)",
          UUID.fromString(user.id()),
          user.name(),
          user.email(),
          user.phone(),
          password,
          Timestamp.from(user.createdAt()));
      return Optional.of(user);
    } catch (DataIntegrityViolationException e) {
      // unique constraint on email violated
      return Optional.empty();
    }
  }

  public boolean existsByEmail(String email) {
    Integer count =
        jdbc.queryForObject(
            "SELECT COUNT(*) FROM app_user WHERE email = ?", Integer.class, email);
    return count != null && count > 0;
  }

  public AppUser findByEmail(String email) {
    try {
      return jdbc.queryForObject(
          "SELECT id, name, email, phone, created_at FROM app_user WHERE email = ?",
          this::mapUser,
          email);
    } catch (EmptyResultDataAccessException e) {
      return null;
    }
  }

  public boolean matchesPassword(String email, String password) {
    try {
      String stored =
          jdbc.queryForObject(
              "SELECT password FROM app_user WHERE email = ?", String.class, email);
      return stored != null && stored.equals(password);
    } catch (EmptyResultDataAccessException e) {
      return false;
    }
  }

  public List<AppUser> users() {
    return jdbc.query(
        "SELECT id, name, email, phone, created_at FROM app_user ORDER BY created_at DESC",
        this::mapUser);
  }

  public void deleteUser(String id) {
    jdbc.update("DELETE FROM app_user WHERE id = ?", UUID.fromString(id));
  }

  private AppUser mapUser(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
    return new AppUser(
        rs.getString("id"),
        rs.getString("name"),
        rs.getString("email"),
        rs.getString("phone"),
        rs.getTimestamp("created_at").toInstant());
  }
}
