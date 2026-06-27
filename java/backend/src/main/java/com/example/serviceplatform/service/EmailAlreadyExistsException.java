package com.example.serviceplatform.service;

/** Thrown when signup is attempted with an email that's already registered. */
public class EmailAlreadyExistsException extends RuntimeException {
  public EmailAlreadyExistsException(String email) {
    super("Email already registered: " + email);
  }
}
