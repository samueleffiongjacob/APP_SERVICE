package repository

import (
	"context"
	"fmt"
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"service-platform/golang/backend/internal/domain"
)

// Store wraps a pgxpool.Pool and implements all repository methods.
// Every public method is safe for concurrent use — the pool handles that.
type Store struct {
	db *pgxpool.Pool
}

// New connects to Postgres using dsn and returns a ready Store.
// Call Migrate(ctx, pool) before New if you want auto table creation.
func New(ctx context.Context, dsn string) (*Store, error) {
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, fmt.Errorf("cannot create connection pool: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("cannot reach postgres: %w", err)
	}
	return &Store{db: pool}, nil
}

// Close releases all pool connections. Call on server shutdown.
func (s *Store) Close() {
	s.db.Close()
}

// Pool exposes the underlying pgxpool for use in migrations.
func (s *Store) Pool() *pgxpool.Pool {
	return s.db
}

// ── User ─────────────────────────────────────────────────────────────────────

func (s *Store) CreateUser(user domain.AppUser, password string) (domain.AppUser, error) {
	user.ID = newID()
	user.CreatedAt = time.Now().UTC()

	_, err := s.db.Exec(context.Background(),
		`INSERT INTO app_users (id, name, email, phone, password, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		user.ID, user.Name, user.Email, user.Phone, password, user.CreatedAt,
	)
	if err != nil {
		return domain.AppUser{}, fmt.Errorf("CreateUser: %w", err)
	}
	return user, nil
}

func (s *Store) FindUserByCredentials(email, password string) (domain.AppUser, bool) {
	var u domain.AppUser
	err := s.db.QueryRow(context.Background(),
		`SELECT id, name, email, phone, created_at
		 FROM app_users
		 WHERE email = $1 AND password = $2`,
		email, password,
	).Scan(&u.ID, &u.Name, &u.Email, &u.Phone, &u.CreatedAt)
	if err != nil {
		return domain.AppUser{}, false
	}
	return u, true
}

func (s *Store) AllUsers() ([]domain.AppUser, error) {
	rows, err := s.db.Query(context.Background(),
		`SELECT id, name, email, phone, created_at FROM app_users ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, fmt.Errorf("AllUsers: %w", err)
	}
	defer rows.Close()

	var users []domain.AppUser
	for rows.Next() {
		var u domain.AppUser
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Phone, &u.CreatedAt); err != nil {
			return nil, fmt.Errorf("AllUsers scan: %w", err)
		}
		users = append(users, u)
	}
	return users, nil
}

func (s *Store) RemoveUser(id string) bool {
	tag, err := s.db.Exec(context.Background(),
		`DELETE FROM app_users WHERE id = $1`, id,
	)
	return err == nil && tag.RowsAffected() > 0
}

// ── Lead Requests ─────────────────────────────────────────────────────────────

func (s *Store) AllRequests() ([]domain.LeadRequest, error) {
	rows, err := s.db.Query(context.Background(),
		`SELECT id, name, email, phone, service, message, created_at
		 FROM lead_requests ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, fmt.Errorf("AllRequests: %w", err)
	}
	defer rows.Close()

	var reqs []domain.LeadRequest
	for rows.Next() {
		var r domain.LeadRequest
		if err := rows.Scan(&r.ID, &r.Name, &r.Email, &r.Phone, &r.Service, &r.Message, &r.CreatedAt); err != nil {
			return nil, fmt.Errorf("AllRequests scan: %w", err)
		}
		reqs = append(reqs, r)
	}
	return reqs, nil
}

func (s *Store) CreateRequest(req domain.LeadRequest) (domain.LeadRequest, error) {
	req.ID = newID()
	req.CreatedAt = time.Now().UTC()

	_, err := s.db.Exec(context.Background(),
		`INSERT INTO lead_requests (id, name, email, phone, service, message, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		req.ID, req.Name, req.Email, req.Phone, req.Service, req.Message, req.CreatedAt,
	)
	if err != nil {
		return domain.LeadRequest{}, fmt.Errorf("CreateRequest: %w", err)
	}
	return req, nil
}

func (s *Store) RemoveRequest(id string) bool {
	tag, err := s.db.Exec(context.Background(),
		`DELETE FROM lead_requests WHERE id = $1`, id,
	)
	return err == nil && tag.RowsAffected() > 0
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func newID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return time.Now().UTC().Format("20060102150405.000000000")
	}
	return hex.EncodeToString(b)
}


//============================

//old code
// package repository

// import (
// 	"crypto/rand"
// 	"encoding/hex"
// 	"sync"
// 	"time"

// 	"service-platform/golang/backend/internal/domain"
// )

// // Store is a thread-safe in-memory data store.
// // Replace the internals with a real DB client without touching any other layer.
// type Store struct {
// 	mu        sync.RWMutex
// 	users     map[string]domain.AppUser
// 	passwords map[string]string // email → plain password (swap for bcrypt hash in production)
// 	requests  []domain.LeadRequest
// }

// // New returns an initialised, empty Store.
// func New() *Store {
// 	return &Store{
// 		users:     make(map[string]domain.AppUser),
// 		passwords: make(map[string]string),
// 		requests:  make([]domain.LeadRequest, 0),
// 	}
// }

// // ── User ───────────────

// func (s *Store) CreateUser(user domain.AppUser, password string) domain.AppUser {
// 	s.mu.Lock()
// 	defer s.mu.Unlock()
// 	user.ID = newID()
// 	user.CreatedAt = time.Now().UTC()
// 	s.users[user.ID] = user
// 	s.passwords[user.Email] = password
// 	return user
// }

// func (s *Store) FindUserByCredentials(email, password string) (domain.AppUser, bool) {
// 	s.mu.RLock()
// 	defer s.mu.RUnlock()
// 	for _, u := range s.users {
// 		if u.Email == email && s.passwords[email] == password {
// 			return u, true
// 		}
// 	}
// 	return domain.AppUser{}, false
// }

// func (s *Store) AllUsers() []domain.AppUser {
// 	s.mu.RLock()
// 	defer s.mu.RUnlock()
// 	result := make([]domain.AppUser, 0, len(s.users))
// 	for _, u := range s.users {
// 		result = append(result, u)
// 	}
// 	return result
// }

// func (s *Store) RemoveUser(id string) bool {
// 	s.mu.Lock()
// 	defer s.mu.Unlock()
// 	u, ok := s.users[id]
// 	if !ok {
// 		return false
// 	}
// 	delete(s.passwords, u.Email)
// 	delete(s.users, id)
// 	return true
// }

// // ── Lead Requests ────────────────────────
// func (s *Store) AllRequests() []domain.LeadRequest {
// 	s.mu.RLock()
// 	defer s.mu.RUnlock()
// 	result := make([]domain.LeadRequest, len(s.requests))
// 	copy(result, s.requests)
// 	return result
// }

// func (s *Store) CreateRequest(req domain.LeadRequest) domain.LeadRequest {
// 	s.mu.Lock()
// 	defer s.mu.Unlock()
// 	req.ID = newID()
// 	req.CreatedAt = time.Now().UTC()
// 	s.requests = append(s.requests, req)
// 	return req
// }

// func (s *Store) RemoveRequest(id string) bool {
// 	s.mu.Lock()
// 	defer s.mu.Unlock()
// 	for i, r := range s.requests {
// 		if r.ID == id {
// 			s.requests = append(s.requests[:i], s.requests[i+1:]...)
// 			return true
// 		}
// 	}
// 	return false
// }
// // ── Helpers ──────────────────────

// func newID() string {
// 	b := make([]byte, 16)
// 	if _, err := rand.Read(b); err != nil {
// 		return time.Now().UTC().Format("20060102150405.000000000")
// 	}
// 	return hex.EncodeToString(b)
// }
