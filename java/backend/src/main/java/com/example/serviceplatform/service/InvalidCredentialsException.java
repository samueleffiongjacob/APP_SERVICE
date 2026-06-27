package com.example.serviceplatform.service;

/** Thrown when login fails because the email doesn't exist or the password doesn't match. */
public class InvalidCredentialsException extends RuntimeException {
  public InvalidCredentialsException() {
    super("Invalid email or password");
  }
}
