package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string
	DSN  string // PostgreSQL connection string
}

func Load() Config {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, relying on system environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	return Config{Port: ":" + port, DSN: dsn}
}















//=========

// package config

// import (
// 	"os"
// )

// // Config holds all application-level configuration.
// // Values are read from environment variables with sensible defaults.
// type Config struct {
// 	Port string
// 	DSN     string // PostgreSQL connection string
// }

// // Load reads configuration from the environment.
// func Load() Config {
// 	port := os.Getenv("PORT")
// 	if port == "" {
// 		port = "8082"
// 	}

// 	host := getEnv("DB_HOST", "localhost")
// 	dbPort := getEnv("DB_PORT", "5432")
// 	user := getEnv("DB_USER", "postgres")
// 	password := getEnv("DB_PASSWORD", "")
// 	dbName := getEnv("DB_NAME", "service_platform")


// 	dsn := "host=" + host +
// 		" port=" + dbPort +
// 		" user=" + user +
// 		" password=" + password +
// 		" dbname=" + dbName +
// 		" sslmode=disable"

// 	return Config{Port: ":" + port, DSN: dsn}
// }

// func getEnv(key, fallback string) string {
// 	if v := os.Getenv(key); v != "" {
// 		return v
// 	}
// 	return fallback
// }
