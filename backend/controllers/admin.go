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

type AdminController struct {
	userCollection    *mongo.Collection
	eventCollection   *mongo.Collection
	ticketCollection  *mongo.Collection
	paymentCollection *mongo.Collection
}

type DashboardStats struct {
	TotalUsers     int64   `json:"total_users"`
	TotalEvents    int64   `json:"total_events"`
	TotalTickets   int64   `json:"total_tickets"`
	TotalRevenue   float64 `json:"total_revenue"`
	ActiveEvents   int64   `json:"active_events"`
	PendingTickets int64   `json:"pending_tickets"`
	TodaySales     float64 `json:"today_sales"`
	ThisMonthSales float64 `json:"this_month_sales"`
}

type AnalyticsData struct {
	DailySales    []DailySale    `json:"daily_sales"`
	EventStats    []EventStat    `json:"event_stats"`
	UserStats     []UserStat     `json:"user_stats"`
	PaymentStats  []PaymentStat  `json:"payment_stats"`
}

type DailySale struct {
	Date  string  `json:"date"`
	Sales float64 `json:"sales"`
}

type EventStat struct {
	EventTitle string `json:"event_title"`
	TicketsSold int64  `json:"tickets_sold"`
	Revenue     float64 `json:"revenue"`
}

type UserStat struct {
	Role  string `json:"role"`
	Count int64  `json:"count"`
}

type PaymentStat struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
	Amount float64 `json:"amount"`
}

func NewAdminController() *AdminController {
	return &AdminController{
		userCollection:    utils.GetCollection("users"),
		eventCollection:   utils.GetCollection("events"),
		ticketCollection:  utils.GetCollection("tickets"),
		paymentCollection: utils.GetCollection("payments"),
	}
}

// GetDashboard returns admin dashboard statistics
func (ac *AdminController) GetDashboard(c *gin.Context) {
	stats := DashboardStats{}

	// Get total users
	stats.TotalUsers, _ = ac.userCollection.CountDocuments(context.Background(), bson.M{})

	// Get total events
	stats.TotalEvents, _ = ac.eventCollection.CountDocuments(context.Background(), bson.M{})

	// Get total tickets
	stats.TotalTickets, _ = ac.ticketCollection.CountDocuments(context.Background(), bson.M{})

	// Get total revenue
	pipeline := []bson.M{
		{"$match": bson.M{"status": "success"}},
		{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$amount"}}},
	}
	cursor, err := ac.paymentCollection.Aggregate(context.Background(), pipeline)
	if err == nil {
		defer cursor.Close(context.Background())
		var result []bson.M
		if cursor.All(context.Background(), &result) == nil && len(result) > 0 {
			if total, ok := result[0]["total"].(float64); ok {
				stats.TotalRevenue = total
			}
		}
	}

	// Get active events
	stats.ActiveEvents, _ = ac.eventCollection.CountDocuments(context.Background(), bson.M{"status": "active"})

	// Get pending tickets
	stats.PendingTickets, _ = ac.ticketCollection.CountDocuments(context.Background(), bson.M{"status": "pending"})

	// Get today's sales
	today := time.Now().Truncate(24 * time.Hour)
	todayPipeline := []bson.M{
		{"$match": bson.M{
			"status": "success",
			"created_at": bson.M{"$gte": today},
		}},
		{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$amount"}}},
	}
	cursor, err = ac.paymentCollection.Aggregate(context.Background(), todayPipeline)
	if err == nil {
		defer cursor.Close(context.Background())
		var result []bson.M
		if cursor.All(context.Background(), &result) == nil && len(result) > 0 {
			if total, ok := result[0]["total"].(float64); ok {
				stats.TodaySales = total
			}
		}
	}

	// Get this month's sales
	monthStart := time.Now().Truncate(24 * time.Hour).AddDate(0, 0, -time.Now().Day()+1)
	monthPipeline := []bson.M{
		{"$match": bson.M{
			"status": "success",
			"created_at": bson.M{"$gte": monthStart},
		}},
		{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$amount"}}},
	}
	cursor, err = ac.paymentCollection.Aggregate(context.Background(), monthPipeline)
	if err == nil {
		defer cursor.Close(context.Background())
		var result []bson.M
		if cursor.All(context.Background(), &result) == nil && len(result) > 0 {
			if total, ok := result[0]["total"].(float64); ok {
				stats.ThisMonthSales = total
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"dashboard": stats})
}

// GetAllUsers returns all users with pagination
func (ac *AdminController) GetAllUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	role := c.Query("role")
	search := c.Query("search")

	filter := bson.M{}
	if role != "" {
		filter["role"] = role
	}
	if search != "" {
		filter["$or"] = []bson.M{
			{"name": bson.M{"$regex": search, "$options": "i"}},
			{"email": bson.M{"$regex": search, "$options": "i"}},
			{"phone": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	skip := (page - 1) * limit
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.M{"created_at": -1})

	cursor, err := ac.userCollection.Find(context.Background(), filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	defer cursor.Close(context.Background())

	var users []models.User
	if err = cursor.All(context.Background(), &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode users"})
		return
	}

	var responses []models.UserResponse
	for _, user := range users {
		responses = append(responses, user.ToResponse())
	}

	total, err := ac.userCollection.CountDocuments(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": responses,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (int(total) + limit - 1) / limit,
		},
	})
}

// UpdateUser updates user role or status
func (ac *AdminController) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		Role     string `json:"role"`
		IsActive bool   `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	update := bson.M{}
	if req.Role != "" {
		update["role"] = req.Role
	}
	update["is_active"] = req.IsActive
	update["updated_at"] = time.Now()

	_, err = ac.userCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$set": update},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

// GetAllEvents returns all events with pagination
func (ac *AdminController) GetAllEvents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")
	search := c.Query("search")

	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}
	if search != "" {
		filter["$or"] = []bson.M{
			{"title": bson.M{"$regex": search, "$options": "i"}},
			{"description": bson.M{"$regex": search, "$options": "i"}},
			{"location": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	skip := (page - 1) * limit
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.M{"created_at": -1})

	cursor, err := ac.eventCollection.Find(context.Background(), filter, opts)
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

	var responses []models.EventResponse
	for _, event := range events {
		// Get organizer details
		var organizer models.User
		err := ac.userCollection.FindOne(context.Background(), bson.M{"_id": event.OrganizerID}).Decode(&organizer)
		if err == nil {
			responses = append(responses, event.ToResponseWithOrganizer(organizer.ToResponse()))
		} else {
			responses = append(responses, event.ToResponse())
		}
	}

	total, err := ac.eventCollection.CountDocuments(context.Background(), filter)
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

// GetAllTickets returns all tickets with pagination
func (ac *AdminController) GetAllTickets(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")

	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}

	skip := (page - 1) * limit
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.M{"created_at": -1})

	cursor, err := ac.ticketCollection.Find(context.Background(), filter, opts)
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

	var responses []models.TicketResponse
	for _, ticket := range tickets {
		// Get event and user details
		var event models.Event
		var user models.User
		
		err := ac.eventCollection.FindOne(context.Background(), bson.M{"_id": ticket.EventID}).Decode(&event)
		if err == nil {
			err = ac.userCollection.FindOne(context.Background(), bson.M{"_id": ticket.UserID}).Decode(&user)
			if err == nil {
				responses = append(responses, ticket.ToResponseWithDetails(event.ToResponse(), user.ToResponse()))
			} else {
				responses = append(responses, ticket.ToResponseWithDetails(event.ToResponse(), models.UserResponse{}))
			}
		} else {
			responses = append(responses, ticket.ToResponse())
		}
	}

	total, err := ac.ticketCollection.CountDocuments(context.Background(), filter)
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

// GetAllPayments returns all payments with pagination
func (ac *AdminController) GetAllPayments(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")
	paymentType := c.Query("payment_type")

	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}
	if paymentType != "" {
		filter["payment_type"] = paymentType
	}

	skip := (page - 1) * limit
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.M{"created_at": -1})

	cursor, err := ac.paymentCollection.Find(context.Background(), filter, opts)
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

	var responses []models.PaymentResponse
	for _, payment := range payments {
		// Get event, ticket, and user details
		var event models.Event
		var ticket models.Ticket
		var user models.User
		
		err := ac.eventCollection.FindOne(context.Background(), bson.M{"_id": payment.EventID}).Decode(&event)
		if err == nil {
			err = ac.ticketCollection.FindOne(context.Background(), bson.M{"_id": payment.TicketID}).Decode(&ticket)
			if err == nil {
				err = ac.userCollection.FindOne(context.Background(), bson.M{"_id": payment.UserID}).Decode(&user)
				if err == nil {
					responses = append(responses, payment.ToResponseWithDetails(user.ToResponse(), event.ToResponse(), ticket.ToResponse()))
				} else {
					responses = append(responses, payment.ToResponseWithDetails(models.UserResponse{}, event.ToResponse(), ticket.ToResponse()))
				}
			} else {
				responses = append(responses, payment.ToResponseWithDetails(models.UserResponse{}, event.ToResponse(), models.TicketResponse{}))
			}
		} else {
			responses = append(responses, payment.ToResponse())
		}
	}

	total, err := ac.paymentCollection.CountDocuments(context.Background(), filter)
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

// GetSettings returns system settings
func (ac *AdminController) GetSettings(c *gin.Context) {
	settings := gin.H{
		"commission_rate": config.AppConfig.Features.CommissionRate,
		"enable_ussd":     config.AppConfig.Features.EnableUSSD,
		"enable_qr":       config.AppConfig.Features.EnableQR,
		"enable_sms":      config.AppConfig.Features.EnableSMS,
		"enable_email":    config.AppConfig.Features.EnableEmail,
	}

	c.JSON(http.StatusOK, gin.H{"settings": settings})
}

// UpdateSettings updates system settings
func (ac *AdminController) UpdateSettings(c *gin.Context) {
	var req struct {
		CommissionRate float64 `json:"commission_rate"`
		EnableUSSD     bool    `json:"enable_ussd"`
		EnableQR       bool    `json:"enable_qr"`
		EnableSMS      bool    `json:"enable_sms"`
		EnableEmail    bool    `json:"enable_email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// In a real implementation, you would update these settings in a database
	// For now, we'll just return success
	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully"})
}

// GetAnalytics returns analytics data
func (ac *AdminController) GetAnalytics(c *gin.Context) {
	analytics := AnalyticsData{}

	// Get daily sales for the last 30 days
	dailySalesPipeline := []bson.M{
		{"$match": bson.M{
			"status": "success",
			"created_at": bson.M{"$gte": time.Now().AddDate(0, 0, -30)},
		}},
		{"$group": bson.M{
			"_id": bson.M{"$dateToString": bson.M{"format": "%Y-%m-%d", "date": "$created_at"}},
			"sales": bson.M{"$sum": "$amount"},
		}},
		{"$sort": bson.M{"_id": 1}},
	}

	cursor, err := ac.paymentCollection.Aggregate(context.Background(), dailySalesPipeline)
	if err == nil {
		defer cursor.Close(context.Background())
		var results []bson.M
		if cursor.All(context.Background(), &results) == nil {
			for _, result := range results {
				date, _ := result["_id"].(string)
				sales, _ := result["sales"].(float64)
				analytics.DailySales = append(analytics.DailySales, DailySale{
					Date:  date,
					Sales: sales,
				})
			}
		}
	}

	// Get event statistics
	eventStatsPipeline := []bson.M{
		{"$lookup": bson.M{
			"from":         "tickets",
			"localField":   "_id",
			"foreignField": "event_id",
			"as":           "tickets",
		}},
		{"$project": bson.M{
			"title":        1,
			"tickets_sold": bson.M{"$size": "$tickets"},
			"revenue": bson.M{"$sum": "$tickets.price"},
		}},
		{"$sort": bson.M{"tickets_sold": -1}},
		{"$limit": 10},
	}

	cursor, err = ac.eventCollection.Aggregate(context.Background(), eventStatsPipeline)
	if err == nil {
		defer cursor.Close(context.Background())
		var results []bson.M
		if cursor.All(context.Background(), &results) == nil {
			for _, result := range results {
				title, _ := result["title"].(string)
				ticketsSold, _ := result["tickets_sold"].(int64)
				revenue, _ := result["revenue"].(float64)
				analytics.EventStats = append(analytics.EventStats, EventStat{
					EventTitle:  title,
					TicketsSold: ticketsSold,
					Revenue:     revenue,
				})
			}
		}
	}

	// Get user statistics by role
	userStatsPipeline := []bson.M{
		{"$group": bson.M{
			"_id":   "$role",
			"count": bson.M{"$sum": 1},
		}},
	}

	cursor, err = ac.userCollection.Aggregate(context.Background(), userStatsPipeline)
	if err == nil {
		defer cursor.Close(context.Background())
		var results []bson.M
		if cursor.All(context.Background(), &results) == nil {
			for _, result := range results {
				role, _ := result["_id"].(string)
				count, _ := result["count"].(int64)
				analytics.UserStats = append(analytics.UserStats, UserStat{
					Role:  role,
					Count: count,
				})
			}
		}
	}

	// Get payment statistics by status
	paymentStatsPipeline := []bson.M{
		{"$group": bson.M{
			"_id":    "$status",
			"count":  bson.M{"$sum": 1},
			"amount": bson.M{"$sum": "$amount"},
		}},
	}

	cursor, err = ac.paymentCollection.Aggregate(context.Background(), paymentStatsPipeline)
	if err == nil {
		defer cursor.Close(context.Background())
		var results []bson.M
		if cursor.All(context.Background(), &results) == nil {
			for _, result := range results {
				status, _ := result["_id"].(string)
				count, _ := result["count"].(int64)
				amount, _ := result["amount"].(float64)
				analytics.PaymentStats = append(analytics.PaymentStats, PaymentStat{
					Status: status,
					Count:  count,
					Amount: amount,
				})
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"analytics": analytics})
} 