package com.example.serviceplatform.service;

/** Thrown when a delete/lookup is attempted on a request id that doesn't exist. */
public class RequestNotFoundException extends RuntimeException {
  public RequestNotFoundException(String id) {
    super("Request not found: " + id);
  }
}
