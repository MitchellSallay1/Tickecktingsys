package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Ticket struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	EventID    primitive.ObjectID `bson:"event_id" json:"event_id" validate:"required"`
	UserID     primitive.ObjectID `bson:"user_id" json:"user_id" validate:"required"`
	TicketCode string            `bson:"ticket_code" json:"ticket_code" validate:"required"`
	QRCode     string            `bson:"qr_code" json:"qr_code"`
	Status     string            `bson:"status" json:"status" validate:"required,oneof=pending paid used cancelled refunded"`
	Price      float64           `bson:"price" json:"price" validate:"required,min=0"`
	Quantity   int               `bson:"quantity" json:"quantity" validate:"required,min=1"`
	UsedAt     *time.Time        `bson:"used_at,omitempty" json:"used_at,omitempty"`
	CreatedAt  time.Time         `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time         `bson:"updated_at" json:"updated_at"`
}

type TicketResponse struct {
	ID         primitive.ObjectID `json:"id"`
	EventID    primitive.ObjectID `json:"event_id"`
	UserID     primitive.ObjectID `json:"user_id"`
	TicketCode string            `json:"ticket_code"`
	QRCode     string            `json:"qr_code"`
	Status     string            `json:"status"`
	Price      float64           `json:"price"`
	Quantity   int               `json:"quantity"`
	UsedAt     *time.Time        `json:"used_at,omitempty"`
	Event      EventResponse     `json:"event,omitempty"`
	User       UserResponse      `json:"user,omitempty"`
	CreatedAt  time.Time         `json:"created_at"`
	UpdatedAt  time.Time         `json:"updated_at"`
}

type CreateTicketRequest struct {
	EventID  primitive.ObjectID `json:"event_id" validate:"required"`
	Quantity int               `json:"quantity" validate:"required,min=1"`
}

type VerifyTicketRequest struct {
	TicketCode string `json:"ticket_code" validate:"required"`
	EventID    string `json:"event_id" validate:"required"`
}

type VerifyTicketResponse struct {
	Valid   bool   `json:"valid"`
	Message string `json:"message"`
	Ticket  *TicketResponse `json:"ticket,omitempty"`
}

type TicketFilter struct {
	EventID string `json:"event_id"`
	UserID  string `json:"user_id"`
	Status  string `json:"status"`
	Page    int    `json:"page" validate:"min=1"`
	Limit   int    `json:"limit" validate:"min=1,max=100"`
}

// IsValid checks if the ticket is valid for use
func (t *Ticket) IsValid() bool {
	return t.Status == "paid" && t.UsedAt == nil
}

// IsUsed checks if the ticket has been used
func (t *Ticket) IsUsed() bool {
	return t.UsedAt != nil
}

// CanBeUsed checks if the ticket can be used for entry
func (t *Ticket) CanBeUsed() bool {
	return t.IsValid() && !t.IsUsed()
}

// MarkAsUsed marks the ticket as used
func (t *Ticket) MarkAsUsed() {
	now := time.Now()
	t.UsedAt = &now
	t.Status = "used"
	t.UpdatedAt = time.Now()
}

// ToResponse converts Ticket to TicketResponse
func (t *Ticket) ToResponse() TicketResponse {
	return TicketResponse{
		ID:         t.ID,
		EventID:    t.EventID,
		UserID:     t.UserID,
		TicketCode: t.TicketCode,
		QRCode:     t.QRCode,
		Status:     t.Status,
		Price:      t.Price,
		Quantity:   t.Quantity,
		UsedAt:     t.UsedAt,
		CreatedAt:  t.CreatedAt,
		UpdatedAt:  t.UpdatedAt,
	}
}

// ToResponseWithDetails converts Ticket to TicketResponse with event and user details
func (t *Ticket) ToResponseWithDetails(event EventResponse, user UserResponse) TicketResponse {
	response := t.ToResponse()
	response.Event = event
	response.User = user
	return response
}

// GenerateTicketCode generates a unique ticket code
func GenerateTicketCode() string {
	// In a real implementation, you might want to use a more sophisticated algorithm
	// For now, we'll use a simple timestamp-based approach
	return "TIX-" + time.Now().Format("20060102150405") + "-" + primitive.NewObjectID().Hex()[:8]
} 