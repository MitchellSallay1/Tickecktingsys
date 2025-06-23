package controllers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"eventticketing/models"
	"eventticketing/services"
	"eventticketing/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PaymentController struct {
	paymentCollection *mongo.Collection
	ticketCollection  *mongo.Collection
	eventCollection   *mongo.Collection
	userCollection    *mongo.Collection
	momoService       *services.MoMoService
	smsService        *services.SMSService
}

func NewPaymentController() *PaymentController {
	return &PaymentController{
		paymentCollection: utils.GetCollection("payments"),
		ticketCollection:  utils.GetCollection("tickets"),
		eventCollection:   utils.GetCollection("events"),
		userCollection:    utils.GetCollection("users"),
		momoService:       services.NewMoMoService(),
		smsService:        services.NewSMSService(),
	}
}

// InitiatePayment initiates a payment for tickets
func (pc *PaymentController) InitiatePayment(c *gin.Context) {
	user, exists := utils.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.InitiatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Check if event exists
	var event models.Event
	err := pc.eventCollection.FindOne(context.Background(), bson.M{"_id": req.EventID}).Decode(&event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch event"})
		return
	}

	// Check if event can accommodate the requested tickets
	if !event.CanPurchaseTickets(req.Quantity) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not enough tickets available"})
		return
	}

	// Calculate total amount
	totalAmount := event.Price * float64(req.Quantity)

	// Create ticket first
	ticket := models.Ticket{
		EventID:    req.EventID,
		UserID:     user.ID,
		TicketCode: models.GenerateTicketCode(),
		Status:     "pending",
		Price:      totalAmount,
		Quantity:   req.Quantity,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Insert ticket into database
	ticketResult, err := pc.ticketCollection.InsertOne(context.Background(), ticket)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ticket"})
		return
	}

	ticket.ID = ticketResult.InsertedID.(primitive.ObjectID)

	// Create payment record
	payment := models.Payment{
		UserID:      user.ID,
		EventID:     req.EventID,
		TicketID:    ticket.ID,
		Amount:      totalAmount,
		Status:      "pending",
		PaymentType: req.PaymentType,
		PhoneNumber: req.PhoneNumber,
		Description: fmt.Sprintf("Payment for %d ticket(s) - %s", req.Quantity, event.Title),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Insert payment into database
	paymentResult, err := pc.paymentCollection.InsertOne(context.Background(), payment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment"})
		return
	}

	payment.ID = paymentResult.InsertedID.(primitive.ObjectID)

	// Initiate MoMo payment
	if req.PaymentType == "momo" {
		momoResponse, err := pc.momoService.InitiatePayment(&payment, &event)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initiate payment"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Payment initiated successfully",
			"payment": payment.ToResponse(),
			"momo":    momoResponse,
		})
	} else {
		// For USSD payments, just return the payment details
		c.JSON(http.StatusOK, gin.H{
			"message": "Payment initiated successfully",
			"payment": payment.ToResponse(),
		})
	}
}

// HandleMoMoCallback handles MoMo payment callbacks
func (pc *PaymentController) HandleMoMoCallback(c *gin.Context) {
	var callback models.MoMoCallbackRequest
	if err := c.ShouldBindJSON(&callback); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid callback data"})
		return
	}

	// Find payment by reference
	var payment models.Payment
	err := pc.paymentCollection.FindOne(context.Background(), bson.M{"momo_ref": callback.Reference}).Decode(&payment)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	// Update payment status
	if callback.Status == "success" {
		payment.MarkAsSuccessful(callback.Reference)
	} else {
		payment.MarkAsFailed()
	}

	// Update payment in database
	_, err = pc.paymentCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": payment.ID},
		bson.M{"$set": bson.M{
			"status":     payment.Status,
			"momo_ref":   payment.MoMoRef,
			"updated_at": payment.UpdatedAt,
		}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment"})
		return
	}

	// If payment successful, update ticket status
	if payment.IsSuccessful() {
		_, err = pc.ticketCollection.UpdateOne(
			context.Background(),
			bson.M{"_id": payment.TicketID},
			bson.M{"$set": bson.M{
				"status":     "paid",
				"updated_at": time.Now(),
			}},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ticket"})
			return
		}

		// Send SMS notification
		go pc.sendTicketSMS(&payment)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Callback processed successfully"})
}

// GetPayments returns payments for the current user
func (pc *PaymentController) GetPayments(c *gin.Context) {
	user, exists := utils.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")

	// Build filter
	filter := bson.M{"user_id": user.ID}
	if status != "" {
		filter["status"] = status
	}

	// Set up pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.M{"created_at": -1})

	// Find payments
	cursor, err := pc.paymentCollection.Find(context.Background(), filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments"})
		return
	}
	defer cursor.Close(context.Background())

	var payments []models.Payment
	if err = cursor.All(context.Background(), &payments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode payments"})
		return
	}

	// Convert to responses with details
	var responses []models.PaymentResponse
	for _, payment := range payments {
		// Get event details
		var event models.Event
		err := pc.eventCollection.FindOne(context.Background(), bson.M{"_id": payment.EventID}).Decode(&event)
		if err != nil {
			continue
		}

		// Get ticket details
		var ticket models.Ticket
		err = pc.ticketCollection.FindOne(context.Background(), bson.M{"_id": payment.TicketID}).Decode(&ticket)
		if err != nil {
			continue
		}

		response := payment.ToResponseWithDetails(user.ToResponse(), event.ToResponse(), ticket.ToResponse())
		responses = append(responses, response)
	}

	// Get total count
	total, err := pc.paymentCollection.CountDocuments(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count payments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payments": responses,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (int(total) + limit - 1) / limit,
		},
	})
}

// sendTicketSMS sends SMS notification for successful ticket purchase
func (pc *PaymentController) sendTicketSMS(payment *models.Payment) {
	// Get ticket details
	var ticket models.Ticket
	err := pc.ticketCollection.FindOne(context.Background(), bson.M{"_id": payment.TicketID}).Decode(&ticket)
	if err != nil {
		return
	}

	// Get event details
	var event models.Event
	err = pc.eventCollection.FindOne(context.Background(), bson.M{"_id": payment.EventID}).Decode(&event)
	if err != nil {
		return
	}

	// Send SMS
	message := fmt.Sprintf("Your ticket for %s has been confirmed. Ticket Code: %s. Event Date: %s", 
		event.Title, ticket.TicketCode, event.Date.Format("2006-01-02 15:04"))
	
	pc.smsService.SendSMS(payment.PhoneNumber, message)
} 