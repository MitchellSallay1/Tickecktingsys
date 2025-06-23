package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string            `bson:"name" json:"name" validate:"required,min=2,max=50"`
	Email     string            `bson:"email" json:"email" validate:"required,email"`
	Phone     string            `bson:"phone" json:"phone" validate:"required"`
	Password  string            `bson:"password" json:"-" validate:"required,min=6"`
	Role      string            `bson:"role" json:"role" validate:"required,oneof=user organizer admin"`
	IsActive  bool              `bson:"is_active" json:"is_active"`
	CreatedAt time.Time         `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time         `bson:"updated_at" json:"updated_at"`
}

type UserResponse struct {
	ID        primitive.ObjectID `json:"id"`
	Name      string            `json:"name"`
	Email     string            `json:"email"`
	Phone     string            `json:"phone"`
	Role      string            `json:"role"`
	IsActive  bool              `json:"is_active"`
	CreatedAt time.Time         `json:"created_at"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Phone    string `json:"phone" validate:"required"`
	Password string `json:"password" validate:"required,min=6"`
	Role     string `json:"role" validate:"required,oneof=user organizer"`
}

type UpdateUserRequest struct {
	Name  string `json:"name" validate:"omitempty,min=2,max=50"`
	Phone string `json:"phone" validate:"omitempty"`
}

// HashPassword hashes the user's password
func (u *User) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

// CheckPassword checks if the provided password matches the hashed password
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// ToResponse converts User to UserResponse (without password)
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		Phone:     u.Phone,
		Role:      u.Role,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
	}
}

// IsAdmin checks if user is admin
func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}

// IsOrganizer checks if user is organizer
func (u *User) IsOrganizer() bool {
	return u.Role == "organizer"
}

// IsUser checks if user is regular user
func (u *User) IsUser() bool {
	return u.Role == "user"
}

// CanAccess checks if user can access a resource based on role
func (u *User) CanAccess(requiredRole string) bool {
	switch requiredRole {
	case "admin":
		return u.IsAdmin()
	case "organizer":
		return u.IsAdmin() || u.IsOrganizer()
	case "user":
		return true
	default:
		return false
	}
} 