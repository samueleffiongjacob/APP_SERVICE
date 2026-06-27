package main

import (
	"context"
	"log"
	"net/http"

	"service-platform/golang/backend/internal/config"
	"service-platform/golang/backend/internal/controller"
	"service-platform/golang/backend/internal/repository"
	"service-platform/golang/backend/internal/service"
)

func main() {
	ctx := context.Background()

	// Config
	cfg := config.Load()

	// Repository — connect to Postgres
	store, err := repository.New(ctx, cfg.DSN)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer store.Close()

	// Run migrations (creates tables if they don't exist)
	if err := repository.Migrate(ctx, store.Pool()); err != nil {
		log.Fatalf("migration failed: %v", err)
	}

	// Services
	userService := service.NewUserService(store)
	requestService := service.NewRequestService(store)

	// Controllers
	authCtrl := controller.NewAuthController(userService)
	userCtrl := controller.NewUserController(userService)
	requestCtrl := controller.NewRequestController(requestService)

	// Router
	router := controller.NewRouter(authCtrl, userCtrl, requestCtrl)

	// Server
	server := &http.Server{Addr: cfg.Port, Handler: router}
	log.Printf("golang api listening on %s", cfg.Port)
	log.Fatal(server.ListenAndServe())
}

// package main

// import (
// 	"log"
// 	"net/http"

// 	"service-platform/golang/backend/internal/config"
// 	"service-platform/golang/backend/internal/controller"
// 	"service-platform/golang/backend/internal/repository"
// 	"service-platform/golang/backend/internal/service"
// )

// func main() {
// 	// Config
// 	cfg := config.Load()

// 	// Repository (data layer)
// 	store := repository.New()

// 	// Services (business logic layer)
// 	userService := service.NewUserService(store)
// 	requestService := service.NewRequestService(store)

// 	// Controllers (HTTP layer)
// 	authCtrl := controller.NewAuthController(userService)
// 	userCtrl := controller.NewUserController(userService)
// 	requestCtrl := controller.NewRequestController(requestService)

// 	// Router (wires routes + middleware)
// 	router := controller.NewRouter(authCtrl, userCtrl, requestCtrl)

// 	// Server
// 	server := &http.Server{Addr: cfg.Port, Handler: router}
// 	log.Printf("golang api listening on %s", cfg.Port)
// 	log.Fatal(server.ListenAndServe())
// }
