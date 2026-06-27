package com.example.serviceplatform.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Single source of truth for CORS. Defined here only — do not add @CrossOrigin
 * on controllers or a second WebMvcConfigurer, or you'll hit the same
 * double-wrapped-middleware problem as the Go service's net/http CORS bug.
 *
 * Origins come from one env var (comma-separated), same pattern as DATABASE_URL.
 * Example: ALLOWED_ORIGINS=http://localhost:3000,https://app.example.com
 */
@Configuration
public class CorsConfig {

  @Value("${ALLOWED_ORIGINS:http://localhost:3000}")
  private String allowedOrigins;

  @Bean
  public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();

    List<String> origins =
        Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
    config.setAllowedOrigins(origins);

    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);

    return new CorsFilter(source);
  }
}