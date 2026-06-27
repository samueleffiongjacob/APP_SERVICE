package domain

import "time"

// AppUser represents a registered user in the system.
type AppUser struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	CreatedAt time.Time `json:"createdAt"`
}

// LeadRequest represents a service enquiry submitted by a visitor.
type LeadRequest struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Service   string    `json:"service"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}
