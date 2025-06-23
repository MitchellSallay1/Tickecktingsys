package controllers

import (
	"context"
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

type TicketController struct {
	ticketCollection *mongo.Collection
	eventCollection  *mongo.Collection
	userCollection   *mongo.Collection
	qrService        *services.QRService
}

func NewTicketController() *TicketController {
	return &TicketController{
		ticketCollection: utils.GetCollection("tickets"),
		eventCollection:  utils.GetCollection("events"),
		userCollection:   utils.GetCollection("users"),
		qrService:        services.NewQRService(),
	}
}

// CreateTicket creates a new ticket for an event
func (tc *TicketController) CreateTicket(c *gin.Context) {
	user, exists := utils.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.CreateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Check if event exists and is available
	var event models.Event
	err := tc.eventCollection.FindOne(context.Background(), bson.M{"_id": req.EventID}).Decode(&event)
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

	// Create ticket
	ticket := models.Ticket{
		EventID:    req.EventID,
		UserID:     user.ID,
		TicketCode: models.GenerateTicketCode(),
		Status:     "pending",
		Price:      event.Price * float64(req.Quantity),
		Quantity:   req.Quantity,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Generate QR code
	qrCode, err := tc.qrService.GenerateQRCode(ticket.TicketCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate QR code"})
		return
	}
	ticket.QRCode = qrCode

	// Insert ticket into database
	result, err := tc.ticketCollection.InsertOne(context.Background(), ticket)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ticket"})
		return
	}

	ticket.ID = result.InsertedID.(primitive.ObjectID)

	// Update event sold tickets count
	_, err = tc.eventCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": req.EventID},
		bson.M{"$inc": bson.M{"sold_tickets": req.Quantity}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Ticket created successfully",
		"ticket":  ticket.ToResponse(),
	})
}

// GetTicketByID returns a specific ticket by ID
func (tc *TicketController) GetTicketByID(c *gin.Context) {
	user, exists := utils.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}

	var ticket models.Ticket
	err = tc.ticketCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&ticket)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch ticket"})
		return
	}

	// Check if user has permission to view this ticket
	if ticket.UserID != user.ID && user.Role != "admin" && user.Role != "organizer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		return
	}

	// Get event and user details
	var event models.Event
	err = tc.eventCollection.FindOne(context.Background(), bson.M{"_id": ticket.EventID}).Decode(&event)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch event details"})
		return
	}

	var ticketUser models.User
	err = tc.userCollection.FindOne(context.Background(), bson.M{"_id": ticket.UserID}).Decode(&ticketUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
		return
	}

	response := ticket.ToResponseWithDetails(event.ToResponse(), ticketUser.ToResponse())
	c.JSON(http.StatusOK, gin.H{"ticket": response})
}

// GetUserTickets returns tickets for the current user
func (tc *TicketController) GetUserTickets(c *gin.Context) {
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

	// Find tickets
	cursor, err := tc.ticketCollection.Find(context.Background(), filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tickets"})
		return
	}
	defer cursor.Close(context.Background())

	var tickets []models.Ticket
	if err = cursor.All(context.Background(), &tickets); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode tickets"})
		return
	}

	// Convert to responses with details
	var responses []models.TicketResponse
	for _, ticket := range tickets {
		// Get event details
		var event models.Event
		err := tc.eventCollection.FindOne(context.Background(), bson.M{"_id": ticket.EventID}).Decode(&event)
		if err != nil {
			continue // Skip this ticket if event not found
		}

		response := ticket.ToResponseWithDetails(event.ToResponse(), user.ToResponse())
		responses = append(responses, response)
	}

	// Get total count
	total, err := tc.ticketCollection.CountDocuments(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count tickets"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tickets": responses,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (int(total) + limit - 1) / limit,
		},
	})
}

// VerifyTicket verifies a ticket for entry
func (tc *TicketController) VerifyTicket(c *gin.Context) {
	user, exists := utils.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.VerifyTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Find ticket by ticket code
	var ticket models.Ticket
	err := tc.ticketCollection.FindOne(context.Background(), bson.M{"ticket_code": req.TicketCode}).Decode(&ticket)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusOK, gin.H{
				"valid":   false,
				"message": "Invalid ticket code",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify ticket"})
		return
	}

	// Check if ticket is for the specified event
	if req.EventID != ticket.EventID.Hex() {
		c.JSON(http.StatusOK, gin.H{
			"valid":   false,
			"message": "Ticket is not valid for this event",
		})
		return
	}

	// Check if ticket can be used
	if !ticket.CanBeUsed() {
		message := "Ticket is not valid"
		if ticket.IsUsed() {
			message = "Ticket has already been used"
		} else if ticket.Status != "paid" {
			message = "Ticket payment is pending"
		}

		c.JSON(http.StatusOK, gin.H{
			"valid":   false,
			"message": message,
		})
		return
	}

	// Mark ticket as used
	ticket.MarkAsUsed()

	// Update ticket in database
	_, err = tc.ticketCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": ticket.ID},
		bson.M{"$set": bson.M{
			"status":     ticket.Status,
			"used_at":    ticket.UsedAt,
			"updated_at": ticket.UpdatedAt,
		}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ticket"})
		return
	}

	// Get event and user details for response
	var event models.Event
	err = tc.eventCollection.FindOne(context.Background(), bson.M{"_id": ticket.EventID}).Decode(&event)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch event details"})
		return
	}

	var ticketUser models.User
	err = tc.userCollection.FindOne(context.Background(), bson.M{"_id": ticket.UserID}).Decode(&ticketUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
		return
	}

	response := ticket.ToResponseWithDetails(event.ToResponse(), ticketUser.ToResponse())

	c.JSON(http.StatusOK, gin.H{
		"valid":   true,
		"message": "Ticket verified successfully",
		"ticket":  response,
	})
} 