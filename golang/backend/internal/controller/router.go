package controller

import (
	"net/http"

	"service-platform/golang/backend/internal/middleware"
)

// NewRouter registers all routes and returns a ready-to-use http.Handler.
// All controllers are injected here; main.go only calls this function.
func NewRouter(
	authCtrl *AuthController,
	userCtrl *UserController,
	requestCtrl *RequestController,
) http.Handler {
	mux := http.NewServeMux()

	// Health
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// Auth
	mux.HandleFunc("/api/auth/signup", authCtrl.Signup)
	mux.HandleFunc("/api/auth/login", authCtrl.Login)

	// Users
	mux.HandleFunc("/api/users", userCtrl.List)
	mux.HandleFunc("/api/users/", userCtrl.Delete)

	// Lead requests
	
	// mux.HandleFunc("/api/requests", requestCtrl.List)
	// mux.HandleFunc("/api/requests", requestCtrl.Create)
	// mux.HandleFunc("/api/requests", requestCtrl.Delete)

	// Lead requests
	mux.HandleFunc("/api/requests", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			requestCtrl.List(w, r)
		case http.MethodPost:
			requestCtrl.Create(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/requests/", requestCtrl.Delete)

	// Apply global middleware
	return middleware.CORS(mux)
}
