package controller

import (
	"encoding/json"
	"net/http"
	"strings"

	"service-platform/golang/backend/internal/dto"
	"service-platform/golang/backend/internal/service"
)

type AuthController struct {
	userService *service.UserService
}

func NewAuthController(userService *service.UserService) *AuthController {
	return &AuthController{userService: userService}
}

// Signup handles POST /api/auth/signup.
func (c *AuthController) Signup(w http.ResponseWriter, r *http.Request) {
	var req dto.SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	user, err := c.userService.Signup(req)
	if err != nil {
		// Duplicate email comes back as a Postgres unique-constraint error
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			writeError(w, http.StatusConflict, "email already registered")
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, user)
}

// Login handles POST /api/auth/login.
func (c *AuthController) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	user, err := c.userService.Login(req)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, dto.LoginResponse{Token: "demo-token", User: user})
}

//================
// package controller

// import (
// 	"encoding/json"
// 	"net/http"

// 	"service-platform/golang/backend/internal/dto"
// 	"service-platform/golang/backend/internal/service"
// )

// // AuthController handles authentication endpoints.
// type AuthController struct {
// 	userService *service.UserService
// }

// // NewAuthController creates an AuthController with its dependency.
// func NewAuthController(userService *service.UserService) *AuthController {
// 	return &AuthController{userService: userService}
// }

// // Signup handles POST /api/auth/signup.
// func (c *AuthController) Signup(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodPost {
// 		w.WriteHeader(http.StatusMethodNotAllowed)
// 		return
// 	}
// 	var req dto.SignupRequest
// 	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
// 		writeError(w, http.StatusBadRequest, err.Error())
// 		return
// 	}
// 	user, err := c.userService.Signup(req)
// 	if err != nil {
// 		writeError(w, http.StatusBadRequest, err.Error())
// 		return
// 	}
// 	writeJSON(w, http.StatusCreated, user)
// }

// // Login handles POST /api/auth/login.
// func (c *AuthController) Login(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodPost {
// 		w.WriteHeader(http.StatusMethodNotAllowed)
// 		return
// 	}
// 	var req dto.LoginRequest
// 	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
// 		writeError(w, http.StatusBadRequest, err.Error())
// 		return
// 	}
// 	user, err := c.userService.Login(req)
// 	if err != nil {
// 		writeError(w, http.StatusUnauthorized, err.Error())
// 		return
// 	}
// 	writeJSON(w, http.StatusOK, dto.LoginResponse{Token: "demo-token", User: user})
// }
