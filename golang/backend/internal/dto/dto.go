package dto

// ── Auth ───────────────
// SignupRequest is the payload accepted by POST /api/auth/signup.
type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

// LoginRequest is the payload accepted by POST /api/auth/login.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse is returned on a successful login.
type LoginResponse struct {
	Token string `json:"token"`
	User  any    `json:"user"` // domain.AppUser — kept as any to avoid import cycle
}

// ── Lead Requests ───────

// CreateLeadRequest is the payload accepted by POST /api/requests.
type CreateLeadRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Service string `json:"service"`
	Message string `json:"message"`
}

// ── Generic ──────────────────

// ErrorResponse is the standard error envelope.
type ErrorResponse struct {
	Error string `json:"error"`
}
