package com.example.serviceplatform.config;

import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Builds a DataSource from a single DATABASE_URL env var, in the
 * postgres://user:pass@host:port/dbname format (same convention as the Go service),
 * instead of requiring separate spring.datasource.* properties.
 */
@Configuration
public class DataSourceConfig {

  @Value("${DATABASE_URL}")
  private String databaseUrl;

  @Bean
  public DataSource dataSource() {
    // Spring's URI parser chokes on the "postgres://user:pass@" userinfo segment,
    // so we parse it manually and hand JDBC clean, separate pieces.
    URI uri = URI.create(databaseUrl);

    String userInfo = uri.getUserInfo();
    String username = null;
    String password = null;
    if (userInfo != null) {
      String[] parts = userInfo.split(":", 2);
      username = parts[0];
      password = parts.length > 1 ? parts[1] : "";
    }

    int port = uri.getPort() == -1 ? 5432 : uri.getPort();
    String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath();

    HikariDataSource dataSource = new HikariDataSource();
    dataSource.setJdbcUrl(jdbcUrl);
    if (username != null) {
      dataSource.setUsername(username);
      dataSource.setPassword(password);
    }
    return dataSource;
  }
}
