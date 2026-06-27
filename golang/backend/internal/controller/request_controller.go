package controller

import (
	"encoding/json"
	"net/http"
	"strings"

	"service-platform/golang/backend/internal/dto"
	"service-platform/golang/backend/internal/service"
)

type RequestController struct {
	requestService *service.RequestService
}

func NewRequestController(requestService *service.RequestService) *RequestController {
	return &RequestController{requestService: requestService}
}

// List handles GET /api/requests.
func (c *RequestController) List(w http.ResponseWriter, _ *http.Request) {
	reqs, err := c.requestService.List()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not fetch requests")
		return
	}
	writeJSON(w, http.StatusOK, reqs)
}

// Create handles POST /api/requests.
func (c *RequestController) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateLeadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	lead, err := c.requestService.Create(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, lead)
}

// Delete handles DELETE /api/requests/{id}.
func (c *RequestController) Delete(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/requests/")
	if id == "" {
		writeError(w, http.StatusBadRequest, "request id is required")
		return
	}
	if !c.requestService.Delete(id) {
		writeError(w, http.StatusNotFound, "request not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

//===================================
// package controller

// import (
// 	"encoding/json"
// 	"net/http"
// 	"strings"

// 	"service-platform/golang/backend/internal/dto"
// 	"service-platform/golang/backend/internal/service"
// )

// // RequestController handles lead-request endpoints.
// type RequestController struct {
// 	requestService *service.RequestService
// }

// // NewRequestController creates a RequestController with its dependency.
// func NewRequestController(requestService *service.RequestService) *RequestController {
// 	return &RequestController{requestService: requestService}
// }

// // List handles GET /api/requests.
// func (c *RequestController) List(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodGet {
// 		w.WriteHeader(http.StatusMethodNotAllowed)
// 		return
// 	}
// 	writeJSON(w, http.StatusOK, c.requestService.List())
// }

// // Create handles POST /api/requests.
// func (c *RequestController) Create(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodPost {
// 		w.WriteHeader(http.StatusMethodNotAllowed)
// 		return
// 	}
// 	var req dto.CreateLeadRequest
// 	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
// 		writeError(w, http.StatusBadRequest, err.Error())
// 		return
// 	}
// 	lead, err := c.requestService.Create(req)
// 	if err != nil {
// 		writeError(w, http.StatusBadRequest, err.Error())
// 		return
// 	}
// 	writeJSON(w, http.StatusCreated, lead)
// }

// // Delete handles DELETE /api/requests/{id}.
// func (c *RequestController) Delete(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodDelete {
// 		w.WriteHeader(http.StatusMethodNotAllowed)
// 		return
// 	}
// 	id := strings.TrimPrefix(r.URL.Path, "/api/requests/")
// 	if id == "" {
// 		writeError(w, http.StatusBadRequest, "request id is required")
// 		return
// 	}
// 	if !c.requestService.Delete(id) {
// 		writeError(w, http.StatusNotFound, "request not found")
// 		return
// 	}
// 	w.WriteHeader(http.StatusNoContent)
// }