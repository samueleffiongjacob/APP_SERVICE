package com.example.serviceplatform.api;

import com.example.serviceplatform.service.EmailAlreadyExistsException;
import com.example.serviceplatform.service.InvalidCredentialsException;
import com.example.serviceplatform.service.RequestNotFoundException;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(EmailAlreadyExistsException.class)
  public ResponseEntity<Map<String, String>> handleEmailExists(EmailAlreadyExistsException e) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", e.getMessage()));
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  public ResponseEntity<Map<String, String>> handleInvalidCredentials(
      InvalidCredentialsException e) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("error", e.getMessage()));
  }

  @ExceptionHandler(RequestNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleRequestNotFound(RequestNotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", e.getMessage()));
  }
}
