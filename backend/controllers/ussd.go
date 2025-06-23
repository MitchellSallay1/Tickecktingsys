package controllers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
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

type USSDController struct {
	eventCollection   *mongo.Collection
	ticketCollection  *mongo.Collection
	paymentCollection *mongo.Collection
	userCollection    *mongo.Collection
	smsService        *services.SMSService
}

type USSDRequest struct {
	SessionID   string `json:"sessionId"`
	ServiceCode string `json:"serviceCode"`
	PhoneNumber string `json:"phoneNumber"`
	Text        string `json:"text"`
}

type USSDResponse struct {
	SessionID string `json:"sessionId"`
	ServiceCode string `json:"serviceCode"`
	Response   string `json:"response"`
}

func NewUSSDController() *USSDController {
	return &USSDController{
		eventCollection:   utils.GetCollection("events"),
		ticketCollection:  utils.GetCollection("tickets"),
		paymentCollection: utils.GetCollection("payments"),
		userCollection:    utils.GetCollection("users"),
		smsService:        services.NewSMSService(),
	}
}

// HandleUSSDEntry handles USSD menu navigation and ticket purchases
func (uc *USSDController) HandleUSSDEntry(c *gin.Context) {
	var req USSDRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Parse USSD text to determine menu level
	text := req.Text
	menuLevel := len(strings.Split(text, "*"))

	var response string

	switch menuLevel {
	case 0:
		// Main menu
		response = "CON Welcome to EventTix\n1. View Events\n2. Buy Ticket\n3. My Tickets\n4. Help"
	case 1:
		// Level 1 menu
		choice := text
		switch choice {
		case "1":
			response = uc.showEventsMenu(req.SessionID)
		case "2":
			response = uc.showBuyTicketMenu(req.SessionID)
		case "3":
			response = uc.showMyTicketsMenu(req.PhoneNumber)
		case "4":
			response = "CON Help\nCall: +1234567890\nEmail: support@eventtix.com\n\n0. Back"
		default:
			response = "END Invalid option. Please try again."
		}
	case 2:
		// Level 2 menu
		parts := strings.Split(text, "*")
		level1Choice := parts[0]
		level2Choice := parts[1]

		switch level1Choice {
		case "1":
			response = uc.handleEventsMenu(level2Choice, req.SessionID)
		case "2":
			response = uc.handleBuyTicketMenu(level2Choice, req.SessionID, req.PhoneNumber)
		case "3":
			response = uc.handleMyTicketsMenu(level2Choice, req.PhoneNumber)
		default:
			response = "END Invalid option. Please try again."
		}
	case 3:
		// Level 3 menu (event selection and payment)
		parts := strings.Split(text, "*")
		level1Choice := parts[0]
		level2Choice := parts[1]
		level3Choice := parts[2]

		if level1Choice == "2" && level2Choice == "1" {
			response = uc.handleEventSelection(level3Choice, req.SessionID, req.PhoneNumber)
		} else {
			response = "END Invalid option. Please try again."
		}
	case 4:
		// Level 4 menu (payment confirmation)
		parts := strings.Split(text, "*")
		level1Choice := parts[0]
		level2Choice := parts[1]
		level3Choice := parts[2]
		level4Choice := parts[3]

		if level1Choice == "2" && level2Choice == "1" {
			response = uc.handlePaymentConfirmation(level3Choice, level4Choice, req.SessionID, req.PhoneNumber)
		} else {
			response = "END Invalid option. Please try again."
		}
	default:
		response = "END Invalid menu level. Please try again."
	}

	ussdResp := USSDResponse{
		SessionID:   req.SessionID,
		ServiceCode: req.ServiceCode,
		Response:    response,
	}

	c.JSON(http.StatusOK, ussdResp)
}

// showEventsMenu displays available events
func (uc *USSDController) showEventsMenu(sessionID string) string {
	// Get active events
	filter := bson.M{"status": "active"}
	opts := options.Find().SetLimit(5).SetSort(bson.M{"date": 1})

	cursor, err := uc.eventCollection.Find(context.Background(), filter, opts)
	if err != nil {
		return "END Error loading events. Please try again."
	}
	defer cursor.Close(context.Background())

	var events []models.Event
	if err = cursor.All(context.Background(), &events); err != nil {
		return "END Error loading events. Please try again."
	}

	if len(events) == 0 {
		return "END No events available at the moment."
	}

	response := "CON Available Events:\n"
	for i, event := range events {
		response += fmt.Sprintf("%d. %s - %s\n", i+1, event.Title, event.Date.Format("Jan 2"))
	}
	response += "0. Back"

	return response
}

// showBuyTicketMenu shows ticket purchase options
func (uc *USSDController) showBuyTicketMenu(sessionID string) string {
	return "CON Buy Ticket\n1. Select Event\n2. Enter Event Code\n\n0. Back"
}

// showMyTicketsMenu shows user's tickets
func (uc *USSDController) showMyTicketsMenu(phoneNumber string) string {
	// Find user by phone number
	var user models.User
	err := uc.userCollection.FindOne(context.Background(), bson.M{"phone": phoneNumber}).Decode(&user)
	if err != nil {
		return "END User not found. Please register first."
	}

	// Get user's tickets
	filter := bson.M{"user_id": user.ID}
	opts := options.Find().SetLimit(5).SetSort(bson.M{"created_at": -1})

	cursor, err := uc.ticketCollection.Find(context.Background(), filter, opts)
	if err != nil {
		return "END Error loading tickets. Please try again."
	}
	defer cursor.Close(context.Background())

	var tickets []models.Ticket
	if err = cursor.All(context.Background(), &tickets); err != nil {
		return "END Error loading tickets. Please try again."
	}

	if len(tickets) == 0 {
		return "END You have no tickets."
	}

	response := "CON Your Tickets:\n"
	for i, ticket := range tickets {
		// Get event details
		var event models.Event
		err := uc.eventCollection.FindOne(context.Background(), bson.M{"_id": ticket.EventID}).Decode(&event)
		if err != nil {
			continue
		}

		response += fmt.Sprintf("%d. %s - %s\n", i+1, event.Title, ticket.Status)
	}
	response += "0. Back"

	return response
}

// handleEventsMenu handles events menu selection
func (uc *USSDController) handleEventsMenu(choice, sessionID string) string {
	if choice == "0" {
		return "CON Welcome to EventTix\n1. View Events\n2. Buy Ticket\n3. My Tickets\n4. Help"
	}

	// Get event details
	eventIndex, err := strconv.Atoi(choice)
	if err != nil || eventIndex < 1 {
		return "END Invalid event selection."
	}

	filter := bson.M{"status": "active"}
	opts := options.Find().SetLimit(int64(eventIndex)).SetSort(bson.M{"date": 1})

	cursor, err := uc.eventCollection.Find(context.Background(), filter, opts)
	if err != nil {
		return "END Error loading event details."
	}
	defer cursor.Close(context.Background())

	var events []models.Event
	if err = cursor.All(context.Background(), &events); err != nil {
		return "END Error loading event details."
	}

	if eventIndex > len(events) {
		return "END Invalid event selection."
	}

	event := events[eventIndex-1]
	response := fmt.Sprintf("END Event: %s\nDate: %s\nLocation: %s\nPrice: $%.2f\nAvailable: %d tickets", 
		event.Title, event.Date.Format("Jan 2, 2006 15:04"), event.Location, event.Price, event.GetAvailableTickets())

	return response
}

// handleBuyTicketMenu handles buy ticket menu selection
func (uc *USSDController) handleBuyTicketMenu(choice, sessionID, phoneNumber string) string {
	if choice == "0" {
		return "CON Welcome to EventTix\n1. View Events\n2. Buy Ticket\n3. My Tickets\n4. Help"
	}

	switch choice {
	case "1":
		return uc.showEventsMenu(sessionID)
	case "2":
		return "CON Enter Event Code:\n(Enter the event code to proceed)"
	default:
		return "END Invalid option. Please try again."
	}
}

// handleMyTicketsMenu handles my tickets menu selection
func (uc *USSDController) handleMyTicketsMenu(choice, phoneNumber string) string {
	if choice == "0" {
		return "CON Welcome to EventTix\n1. View Events\n2. Buy Ticket\n3. My Tickets\n4. Help"
	}

	// Find user by phone number
	var user models.User
	err := uc.userCollection.FindOne(context.Background(), bson.M{"phone": phoneNumber}).Decode(&user)
	if err != nil {
		return "END User not found. Please register first."
	}

	// Get user's tickets
	filter := bson.M{"user_id": user.ID}
	opts := options.Find().SetLimit(5).SetSort(bson.M{"created_at": -1})

	cursor, err := uc.ticketCollection.Find(context.Background(), filter, opts)
	if err != nil {
		return "END Error loading tickets. Please try again."
	}
	defer cursor.Close(context.Background())

	var tickets []models.Ticket
	if err = cursor.All(context.Background(), &tickets); err != nil {
		return "END Error loading tickets. Please try again."
	}

	ticketIndex, err := strconv.Atoi(choice)
	if err != nil || ticketIndex < 1 || ticketIndex > len(tickets) {
		return "END Invalid ticket selection."
	}

	ticket := tickets[ticketIndex-1]

	// Get event details
	var event models.Event
	err = uc.eventCollection.FindOne(context.Background(), bson.M{"_id": ticket.EventID}).Decode(&event)
	if err != nil {
		return "END Error loading event details."
	}

	response := fmt.Sprintf("END Ticket: %s\nEvent: %s\nCode: %s\nStatus: %s\nDate: %s", 
		ticket.TicketCode, event.Title, ticket.TicketCode, ticket.Status, event.Date.Format("Jan 2, 2006 15:04"))

	return response
}

// handleEventSelection handles event selection for ticket purchase
func (uc *USSDController) handleEventSelection(choice, sessionID, phoneNumber string) string {
	if choice == "0" {
		return "CON Buy Ticket\n1. Select Event\n2. Enter Event Code\n\n0. Back"
	}

	// Get event details
	eventIndex, err := strconv.Atoi(choice)
	if err != nil || eventIndex < 1 {
		return "END Invalid event selection."
	}

	filter := bson.M{"status": "active"}
	opts := options.Find().SetLimit(int64(eventIndex)).SetSort(bson.M{"date": 1})

	cursor, err := uc.eventCollection.Find(context.Background(), filter, opts)
	if err != nil {
		return "END Error loading event details."
	}
	defer cursor.Close(context.Background())

	var events []models.Event
	if err = cursor.All(context.Background(), &events); err != nil {
		return "END Error loading event details."
	}

	if eventIndex > len(events) {
		return "END Invalid event selection."
	}

	event := events[eventIndex-1]

	// Store event selection in session (in a real implementation, use Redis or similar)
	// For now, we'll use a simple approach

	response := fmt.Sprintf("CON Event: %s\nPrice: $%.2f\nQuantity: 1\nTotal: $%.2f\n\n1. Confirm Purchase\n0. Cancel", 
		event.Title, event.Price, event.Price)

	return response
}

// handlePaymentConfirmation handles payment confirmation
func (uc *USSDController) handlePaymentConfirmation(eventChoice, confirmChoice, sessionID, phoneNumber string) string {
	if confirmChoice == "0" {
		return "END Purchase cancelled."
	}

	if confirmChoice != "1" {
		return "END Invalid option. Please try again."
	}

	// Find user by phone number
	var user models.User
	err := uc.userCollection.FindOne(context.Background(), bson.M{"phone": phoneNumber}).Decode(&user)
	if err != nil {
		return "END User not found. Please register first."
	}

	// Get event details
	eventIndex, err := strconv.Atoi(eventChoice)
	if err != nil || eventIndex < 1 {
		return "END Invalid event selection."
	}

	filter := bson.M{"status": "active"}
	opts := options.Find().SetLimit(int64(eventIndex)).SetSort(bson.M{"date": 1})

	cursor, err := uc.eventCollection.Find(context.Background(), filter, opts)
	if err != nil {
		return "END Error loading event details."
	}
	defer cursor.Close(context.Background())

	var events []models.Event
	if err = cursor.All(context.Background(), &events); err != nil {
		return "END Error loading event details."
	}

	if eventIndex > len(events) {
		return "END Invalid event selection."
	}

	event := events[eventIndex-1]

	// Check if event can accommodate tickets
	if !event.CanPurchaseTickets(1) {
		return "END Sorry, no tickets available for this event."
	}

	// Create ticket
	ticket := models.Ticket{
		EventID:    event.ID,
		UserID:     user.ID,
		TicketCode: models.GenerateTicketCode(),
		Status:     "pending",
		Price:      event.Price,
		Quantity:   1,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Insert ticket into database
	result, err := uc.ticketCollection.InsertOne(context.Background(), ticket)
	if err != nil {
		return "END Error creating ticket. Please try again."
	}

	ticket.ID = result.InsertedID.(primitive.ObjectID)

	// Create payment record
	payment := models.Payment{
		UserID:      user.ID,
		EventID:     event.ID,
		TicketID:    ticket.ID,
		Amount:      event.Price,
		Status:      "pending",
		PaymentType: "ussd",
		PhoneNumber: phoneNumber,
		Description: fmt.Sprintf("USSD payment for %s", event.Title),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Insert payment into database
	_, err = uc.paymentCollection.InsertOne(context.Background(), payment)
	if err != nil {
		return "END Error creating payment. Please try again."
	}

	// Update event sold tickets count
	_, err = uc.eventCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": event.ID},
		bson.M{"$inc": bson.M{"sold_tickets": 1}},
	)
	if err != nil {
		return "END Error updating event. Please try again."
	}

	// Send SMS with ticket details
	go uc.smsService.SendTicketConfirmation(phoneNumber, event.Title, ticket.TicketCode, event.Date.Format("Jan 2, 2006 15:04"))

	response := fmt.Sprintf("END Ticket purchased successfully!\nEvent: %s\nTicket Code: %s\nAmount: $%.2f\n\nYou will receive an SMS with your ticket details.", 
		event.Title, ticket.TicketCode, event.Price)

	return response
} 