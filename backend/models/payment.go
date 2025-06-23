package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Payment struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id" validate:"required"`
	EventID     primitive.ObjectID `bson:"event_id" json:"event_id" validate:"required"`
	TicketID    primitive.ObjectID `bson:"ticket_id" json:"ticket_id" validate:"required"`
	Amount      float64           `bson:"amount" json:"amount" validate:"required,min=0"`
	Status      string            `bson:"status" json:"status" validate:"required,oneof=pending success failed cancelled"`
	PaymentType string            `bson:"payment_type" json:"payment_type" validate:"required,oneof=momo ussd"`
	MoMoRef     string            `bson:"momo_ref" json:"momo_ref"`
	PhoneNumber string            `bson:"phone_number" json:"phone_number" validate:"required"`
	Description string            `bson:"description" json:"description"`
	CreatedAt   time.Time         `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time         `bson:"updated_at" json:"updated_at"`
}

type PaymentResponse struct {
	ID          primitive.ObjectID `json:"id"`
	UserID      primitive.ObjectID `json:"user_id"`
	EventID     primitive.ObjectID `json:"event_id"`
	TicketID    primitive.ObjectID `json:"ticket_id"`
	Amount      float64           `json:"amount"`
	Status      string            `json:"status"`
	PaymentType string            `json:"payment_type"`
	MoMoRef     string            `json:"momo_ref"`
	PhoneNumber string            `json:"phone_number"`
	Description string            `json:"description"`
	User        UserResponse      `json:"user,omitempty"`
	Event       EventResponse     `json:"event,omitempty"`
	Ticket      TicketResponse    `json:"ticket,omitempty"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

type InitiatePaymentRequest struct {
	EventID     primitive.ObjectID `json:"event_id" validate:"required"`
	Quantity    int               `json:"quantity" validate:"required,min=1"`
	PhoneNumber string            `json:"phone_number" validate:"required"`
	PaymentType string            `json:"payment_type" validate:"required,oneof=momo ussd"`
}

type MoMoCallbackRequest struct {
	Status      string `json:"status"`
	TransactionID string `json:"transaction_id"`
	Amount      string `json:"amount"`
	PhoneNumber string `json:"phone_number"`
	Description string `json:"description"`
	Reference   string `json:"reference"`
}

type PaymentFilter struct {
	UserID      string `json:"user_id"`
	EventID     string `json:"event_id"`
	Status      string `json:"status"`
	PaymentType string `json:"payment_type"`
	DateFrom    string `json:"date_from"`
	DateTo      string `json:"date_to"`
	Page        int    `json:"page" validate:"min=1"`
	Limit       int    `json:"limit" validate:"min=1,max=100"`
}

// IsSuccessful checks if the payment was successful
func (p *Payment) IsSuccessful() bool {
	return p.Status == "success"
}

// IsPending checks if the payment is pending
func (p *Payment) IsPending() bool {
	return p.Status == "pending"
}

// IsFailed checks if the payment failed
func (p *Payment) IsFailed() bool {
	return p.Status == "failed"
}

// IsCancelled checks if the payment was cancelled
func (p *Payment) IsCancelled() bool {
	return p.Status == "cancelled"
}

// MarkAsSuccessful marks the payment as successful
func (p *Payment) MarkAsSuccessful(momoRef string) {
	p.Status = "success"
	p.MoMoRef = momoRef
	p.UpdatedAt = time.Now()
}

// MarkAsFailed marks the payment as failed
func (p *Payment) MarkAsFailed() {
	p.Status = "failed"
	p.UpdatedAt = time.Now()
}

// MarkAsCancelled marks the payment as cancelled
func (p *Payment) MarkAsCancelled() {
	p.Status = "cancelled"
	p.UpdatedAt = time.Now()
}

// ToResponse converts Payment to PaymentResponse
func (p *Payment) ToResponse() PaymentResponse {
	return PaymentResponse{
		ID:          p.ID,
		UserID:      p.UserID,
		EventID:     p.EventID,
		TicketID:    p.TicketID,
		Amount:      p.Amount,
		Status:      p.Status,
		PaymentType: p.PaymentType,
		MoMoRef:     p.MoMoRef,
		PhoneNumber: p.PhoneNumber,
		Description: p.Description,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

// ToResponseWithDetails converts Payment to PaymentResponse with related details
func (p *Payment) ToResponseWithDetails(user UserResponse, event EventResponse, ticket TicketResponse) PaymentResponse {
	response := p.ToResponse()
	response.User = user
	response.Event = event
	response.Ticket = ticket
	return response
} 