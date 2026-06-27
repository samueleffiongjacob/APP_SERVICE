package service

import (
	"errors"

	"service-platform/golang/backend/internal/domain"
	"service-platform/golang/backend/internal/dto"
	"service-platform/golang/backend/internal/repository"
)

// UserRepository is the data-layer contract UserService depends on.
type UserRepository interface {
	CreateUser(user domain.AppUser, password string) (domain.AppUser, error)
	FindUserByCredentials(email, password string) (domain.AppUser, bool)
	AllUsers() ([]domain.AppUser, error)
	RemoveUser(id string) bool
}

// UserService contains all user-related business logic.
type UserService struct {
	repo UserRepository
}

func NewUserService(repo *repository.Store) *UserService {
	return &UserService{repo: repo}
}

// Signup validates the request, creates the user, and returns the saved record.
func (s *UserService) Signup(req dto.SignupRequest) (domain.AppUser, error) {
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return domain.AppUser{}, errors.New("name, email and password are required")
	}
	user := domain.AppUser{
		Name:  req.Name,
		Email: req.Email,
		Phone: req.Phone,
	}
	return s.repo.CreateUser(user, req.Password)
}

// Login validates credentials and returns the matching user.
func (s *UserService) Login(req dto.LoginRequest) (domain.AppUser, error) {
	if req.Email == "" || req.Password == "" {
		return domain.AppUser{}, errors.New("email and password are required")
	}
	user, ok := s.repo.FindUserByCredentials(req.Email, req.Password)
	if !ok {
		return domain.AppUser{}, errors.New("invalid credentials")
	}
	return user, nil
}

// ListUsers returns all registered users.
func (s *UserService) ListUsers() ([]domain.AppUser, error) {
	return s.repo.AllUsers()
}

// DeleteUser removes a user by ID. Returns false when not found.
func (s *UserService) DeleteUser(id string) bool {
	return s.repo.RemoveUser(id)
}

//===========
// package service

// import (
// 	"errors"

// 	"service-platform/golang/backend/internal/domain"
// 	"service-platform/golang/backend/internal/dto"
// 	"service-platform/golang/backend/internal/repository"
// )

// // UserRepository is the subset of repository.Store that UserService needs.
// // Coding to an interface means you can swap stores or mock in tests.
// type UserRepository interface {
// 	CreateUser(user domain.AppUser, password string) domain.AppUser
// 	FindUserByCredentials(email, password string) (domain.AppUser, bool)
// 	AllUsers() ([]domain.AppUser, error)
// 	RemoveUser(id string) bool
// }

// // UserService contains all user-related business logic.
// type UserService struct {
// 	repo UserRepository
// }

// // NewUserService wires the service to a concrete repository.
// func NewUserService(repo *repository.Store) *UserService {
// 	return &UserService{repo: repo}
// }

// // Signup validates the request, creates the user, and returns the saved record.
// func (s *UserService) Signup(req dto.SignupRequest) (domain.AppUser, error) {
// 	if req.Name == "" || req.Email == "" || req.Password == "" {
// 		return domain.AppUser{}, errors.New("name, email and password are required")
// 	}
// 	user := domain.AppUser{
// 		Name:  req.Name,
// 		Email: req.Email,
// 		Phone: req.Phone,
// 	}
// 	created := s.repo.CreateUser(user, req.Password)
// 	return created, nil
// }

// // Login validates credentials and returns the matching user.
// func (s *UserService) Login(req dto.LoginRequest) (domain.AppUser, error) {
// 	if req.Email == "" || req.Password == "" {
// 		return domain.AppUser{}, errors.New("email and password are required")
// 	}
// 	user, ok := s.repo.FindUserByCredentials(req.Email, req.Password)
// 	if !ok {
// 		return domain.AppUser{}, errors.New("invalid credentials")
// 	}
// 	return user, nil
// }

// // ListUsers returns all registered users.
// func (s *UserService) ListUsers() []domain.AppUser {
// 	return s.repo.AllUsers()
// }

// // DeleteUser removes a user by ID. Returns false when the user is not found.
// func (s *UserService) DeleteUser(id string) bool {
// 	return s.repo.RemoveUser(id)
// }
