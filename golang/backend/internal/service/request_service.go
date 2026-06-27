package service

import (
	"errors"

	"service-platform/golang/backend/internal/domain"
	"service-platform/golang/backend/internal/dto"
	"service-platform/golang/backend/internal/repository"
)

// LeadRepository is the data-layer contract RequestService depends on.
type LeadRepository interface {
	AllRequests() ([]domain.LeadRequest, error)
	CreateRequest(req domain.LeadRequest) (domain.LeadRequest, error)
	RemoveRequest(id string) bool
}

// RequestService contains all lead-request business logic.
type RequestService struct {
	repo LeadRepository
}

func NewRequestService(repo *repository.Store) *RequestService {
	return &RequestService{repo: repo}
}

// List returns all lead requests.
func (s *RequestService) List() ([]domain.LeadRequest, error) {
	return s.repo.AllRequests()
}

// Create validates and persists a new lead request.
func (s *RequestService) Create(req dto.CreateLeadRequest) (domain.LeadRequest, error) {
	if req.Name == "" || req.Email == "" || req.Service == "" {
		return domain.LeadRequest{}, errors.New("name, email and service are required")
	}
	lead := domain.LeadRequest{
		Name:    req.Name,
		Email:   req.Email,
		Phone:   req.Phone,
		Service: req.Service,
		Message: req.Message,
	}
	return s.repo.CreateRequest(lead)
}

// Delete removes a lead request by ID. Returns false when not found.
func (s *RequestService) Delete(id string) bool {
	return s.repo.RemoveRequest(id)
}

//============
// package service

// import (
// 	"errors"

// 	"service-platform/golang/backend/internal/domain"
// 	"service-platform/golang/backend/internal/dto"
// 	"service-platform/golang/backend/internal/repository"
// )

// // LeadRepository is the subset of repository.Store that RequestService needs.
// type LeadRepository interface {
// 	AllRequests() ([]domain.LeadRequest, error)
// 	CreateRequest(req domain.LeadRequest) (domain.LeadRequest, error)
// 	RemoveRequest(id string) bool
// }

// // RequestService contains all lead-request business logic.
// type RequestService struct {
// 	repo LeadRepository
// }

// // NewRequestService wires the service to a concrete repository.
// func NewRequestService(repo *repository.Store) *RequestService {
// 	return &RequestService{repo: repo}
// }

// // List returns all lead requests.
// func (s *RequestService) List() []domain.LeadRequest {
// 	return s.repo.AllRequests()
// }

// // Create validates and persists a new lead request.
// func (s *RequestService) Create(req dto.CreateLeadRequest) (domain.LeadRequest, error) {
// 	if req.Name == "" || req.Email == "" || req.Service == "" {
// 		return domain.LeadRequest{}, errors.New("name, email and service are required")
// 	}
// 	lead := domain.LeadRequest{
// 		Name:    req.Name,
// 		Email:   req.Email,
// 		Phone:   req.Phone,
// 		Service: req.Service,
// 		Message: req.Message,
// 	}
// 	return s.repo.CreateRequest(lead), nil
// }

// // Delete removes a lead request by ID. Returns false when not found.
// func (s *RequestService) Delete(id string) bool {
// 	return s.repo.RemoveRequest(id)
// }
