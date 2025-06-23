package controllers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"eventticketing/models"
	"eventticketing/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type EventController struct {
	eventCollection  *mongo.Collection
	userCollection   *mongo.Collection
}

func NewEventController() *EventController {
	return &EventController{
		eventCollection: utils.GetCollection("events"),
		userCollection:  utils.GetCollection("users"),
	}
}

// GetAllEvents returns all active events with optional filtering
func (ec *EventController) GetAllEvents(c *gin.Context) {
	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	category := c.Query("category")
	status := c.Query("status")

	// Build filter
	filter := bson.M{"status": "active"}
	if search != "" {
		filter["$or"] = []bson.M{
			{"title": bson.M{"$regex": search, "$options": "i"}},
			{"description": bson.M{"$regex": search, "$options": "i"}},
			{"location": bson.M{"$regex": search, "$options": "i"}},
		}
	}
	if category != "" {
		filter["category"] = category
	}
	if status != "" {
		filter["status"] = status
	}

	// Set up pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.M{"date": 1})

	// Find events
	cursor, err := ec.eventCollection.Find(context.Background(), filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}
	defer cursor.Close(context.Background())

	var events []models.Event
	if err = cursor.All(context.Background(), &events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode events"})
		return
	}

	// Convert to responses
	var responses []models.EventResponse
	for _, event := range events {
		responses = append(responses, event.ToResponse())
	}

	// Get total count
	total, err := ec.eventCollection.CountDocuments(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"events": responses,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (int(total) + limit - 1) / limit,
		},
	})
}

// GetEventByID returns a specific event by ID
func (ec *EventController) GetEventByID(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var event models.Event
	err = ec.eventCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch event"})
		return
	}

	// Get organizer details
	var organizer models.User
	err = ec.userCollection.FindOne(context.Background(), bson.M{"_id": event.OrganizerID}).Decode(&organizer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch organizer details"})
		return
	}

	response := event.ToResponseWithOrganizer(organizer.ToResponse())
	c.JSON(http.StatusOK, gin.H{"event": response})
}

// CreateEvent creates a new event
func (ec *EventController) CreateEvent(c *gin.Context) {
	user, exists := utils.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Create event
	event := models.Event{
		Title:       req.Title,
		Description: req.Description,
		Date:        req.Date,
		Location:    req.Location,
		Price:       req.Price,
		MaxTickets:  req.MaxTickets,
		SoldTickets: 0,
		Status:      "active",
		Category:    req.Category,
		ImageURL:    req.ImageURL,
		OrganizerID: user.ID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	result, err := ec.eventCollection.InsertOne(context.Background(), event)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	event.ID = result.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Event created successfully",
		"event":   event.ToResponse(),
	})
}

// UpdateEvent updates an existing event
func (ec *EventController) UpdateEvent(c *gin.Context) {
	user, exists := utils.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var req models.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Check if event exists and user has permission
	var event models.Event
	err = ec.eventCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch event"})
		return
	}

	// Check if user is organizer or admin
	if event.OrganizerID != user.ID && user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		return
	}

	// Build update
	update := bson.M{}
	if req.Title != "" {
		update["title"] = req.Title
	}
	if req.Description != "" {
		update["description"] = req.Description
	}
	if !req.Date.IsZero() {
		update["date"] = req.Date
	}
	if req.Location != "" {
		update["location"] = req.Location
	}
	if req.Price > 0 {
		update["price"] = req.Price
	}
	if req.MaxTickets > 0 {
		update["max_tickets"] = req.MaxTickets
	}
	if req.Category != "" {
		update["category"] = req.Category
	}
	if req.ImageURL != "" {
		update["image_url"] = req.ImageURL
	}
	if req.Status != "" {
		update["status"] = req.Status
	}

	if len(update) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	update["updated_at"] = time.Now()

	// Update event
	_, err = ec.eventCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$set": update},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event updated successfully"})
}

// DeleteEvent deletes an event
func (ec *EventController) DeleteEvent(c *gin.Context) {
	user, exists := utils.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	// Check if event exists and user has permission
	var event models.Event
	err = ec.eventCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch event"})
		return
	}

	// Check if user is organizer or admin
	if event.OrganizerID != user.ID && user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		return
	}

	// Delete event
	_, err = ec.eventCollection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}

// GetOrganizerEvents returns events created by the current organizer
func (ec *EventController) GetOrganizerEvents(c *gin.Context) {
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
	filter := bson.M{"organizer_id": user.ID}
	if status != "" {
		filter["status"] = status
	}

	// Set up pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.M{"created_at": -1})

	// Find events
	cursor, err := ec.eventCollection.Find(context.Background(), filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}
	defer cursor.Close(context.Background())

	var events []models.Event
	if err = cursor.All(context.Background(), &events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode events"})
		return
	}

	// Convert to responses
	var responses []models.EventResponse
	for _, event := range events {
		responses = append(responses, event.ToResponse())
	}

	// Get total count
	total, err := ec.eventCollection.CountDocuments(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"events": responses,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (int(total) + limit - 1) / limit,
		},
	})
} 