package controller

import (
	"net/http"
	"strings"

	"service-platform/golang/backend/internal/service"
)

type UserController struct {
	userService *service.UserService
}

func NewUserController(userService *service.UserService) *UserController {
	return &UserController{userService: userService}
}

// List handles GET /api/users.
func (c *UserController) List(w http.ResponseWriter, _ *http.Request) {
	users, err := c.userService.ListUsers()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not fetch users")
		return
	}
	writeJSON(w, http.StatusOK, users)
}

// Delete handles DELETE /api/users/{id}.
func (c *UserController) Delete(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/users/")
	if id == "" {
		writeError(w, http.StatusBadRequest, "user id is required")
		return
	}
	if !c.userService.DeleteUser(id) {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}


//=====================
// package controller

// import (
// 	"net/http"
// 	"strings"

// 	"service-platform/golang/backend/internal/service"
// )

// // UserController handles user management endpoints.
// type UserController struct {
// 	userService *service.UserService
// }

// // NewUserController creates a UserController with its dependency.
// func NewUserController(userService *service.UserService) *UserController {
// 	return &UserController{userService: userService}
// }

// // List handles GET /api/users.
// func (c *UserController) List(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodGet {
// 		w.WriteHeader(http.StatusMethodNotAllowed)
// 		return
// 	}
// 	writeJSON(w, http.StatusOK, c.userService.ListUsers())
// }

// // Delete handles DELETE /api/users/{id}.
// func (c *UserController) Delete(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodDelete {
// 		w.WriteHeader(http.StatusMethodNotAllowed)
// 		return
// 	}
// 	id := strings.TrimPrefix(r.URL.Path, "/api/users/")
// 	if id == "" {
// 		writeError(w, http.StatusBadRequest, "user id is required")
// 		return
// 	}
// 	if !c.userService.DeleteUser(id) {
// 		writeError(w, http.StatusNotFound, "user not found")
// 		return
// 	}
// 	w.WriteHeader(http.StatusNoContent)
// }
