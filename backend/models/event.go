package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Event struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string            `bson:"title" json:"title" validate:"required,min=3,max=100"`
	Description string            `bson:"description" json:"description" validate:"required,min=10"`
	Date        time.Time         `bson:"date" json:"date" validate:"required"`
	Location    string            `bson:"location" json:"location" validate:"required"`
	Price       float64           `bson:"price" json:"price" validate:"required,min=0"`
	MaxTickets  int               `bson:"max_tickets" json:"max_tickets" validate:"required,min=1"`
	SoldTickets int               `bson:"sold_tickets" json:"sold_tickets"`
	Status      string            `bson:"status" json:"status" validate:"required,oneof=active upcoming ongoing completed cancelled"`
	Category    string            `bson:"category" json:"category" validate:"required"`
	ImageURL    string            `bson:"image_url" json:"image_url"`
	OrganizerID primitive.ObjectID `bson:"organizer_id" json:"organizer_id" validate:"required"`
	CreatedAt   time.Time         `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time         `bson:"updated_at" json:"updated_at"`
}

type EventResponse struct {
	ID          primitive.ObjectID `json:"id"`
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Date        time.Time         `json:"date"`
	Location    string            `json:"location"`
	Price       float64           `json:"price"`
	MaxTickets  int               `json:"max_tickets"`
	SoldTickets int               `json:"sold_tickets"`
	Status      string            `json:"status"`
	Category    string            `json:"category"`
	ImageURL    string            `json:"image_url"`
	OrganizerID primitive.ObjectID `json:"organizer_id"`
	Organizer   UserResponse      `json:"organizer,omitempty"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

type CreateEventRequest struct {
	Title       string            `json:"title" validate:"required,min=3,max=100"`
	Description string            `json:"description" validate:"required,min=10"`
	Date        time.Time         `json:"date" validate:"required"`
	Location    string            `json:"location" validate:"required"`
	Price       float64           `json:"price" validate:"required,min=0"`
	MaxTickets  int               `json:"max_tickets" validate:"required,min=1"`
	Category    string            `json:"category" validate:"required"`
	ImageURL    string            `json:"image_url"`
}

type UpdateEventRequest struct {
	Title       string    `json:"title" validate:"omitempty,min=3,max=100"`
	Description string    `json:"description" validate:"omitempty,min=10"`
	Date        time.Time `json:"date" validate:"omitempty"`
	Location    string    `json:"location" validate:"omitempty"`
	Price       float64   `json:"price" validate:"omitempty,min=0"`
	MaxTickets  int       `json:"max_tickets" validate:"omitempty,min=1"`
	Category    string    `json:"category" validate:"omitempty"`
	ImageURL    string    `json:"image_url"`
	Status      string    `json:"status" validate:"omitempty,oneof=active upcoming ongoing completed cancelled"`
}

type EventFilter struct {
	Search   string    `json:"search"`
	Category string    `json:"category"`
	Status   string    `json:"status"`
	DateFrom time.Time `json:"date_from"`
	DateTo   time.Time `json:"date_to"`
	Page     int       `json:"page" validate:"min=1"`
	Limit    int       `json:"limit" validate:"min=1,max=100"`
}

// IsAvailable checks if the event is available for ticket purchase
func (e *Event) IsAvailable() bool {
	return e.Status == "active" && e.SoldTickets < e.MaxTickets
}

// GetAvailableTickets returns the number of available tickets
func (e *Event) GetAvailableTickets() int {
	available := e.MaxTickets - e.SoldTickets
	if available < 0 {
		return 0
	}
	return available
}

// CanPurchaseTickets checks if tickets can be purchased
func (e *Event) CanPurchaseTickets(quantity int) bool {
	return e.IsAvailable() && e.GetAvailableTickets() >= quantity
}

// ToResponse converts Event to EventResponse
func (e *Event) ToResponse() EventResponse {
	return EventResponse{
		ID:          e.ID,
		Title:       e.Title,
		Description: e.Description,
		Date:        e.Date,
		Location:    e.Location,
		Price:       e.Price,
		MaxTickets:  e.MaxTickets,
		SoldTickets: e.SoldTickets,
		Status:      e.Status,
		Category:    e.Category,
		ImageURL:    e.ImageURL,
		OrganizerID: e.OrganizerID,
		CreatedAt:   e.CreatedAt,
		UpdatedAt:   e.UpdatedAt,
	}
}

// ToResponseWithOrganizer converts Event to EventResponse with organizer details
func (e *Event) ToResponseWithOrganizer(organizer UserResponse) EventResponse {
	response := e.ToResponse()
	response.Organizer = organizer
	return response
} 