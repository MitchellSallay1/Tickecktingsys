package main

import (
	"context"
	"log"
	"time"

	"eventticketing/config"
	"eventticketing/models"
	"eventticketing/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Connect to database
	utils.ConnectDB()
	defer utils.DisconnectDB()

	// Create indexes
	utils.CreateIndexes()

	log.Println("Starting database seeding...")

	// Seed admin user
	seedAdminUser()

	// Seed sample events
	seedSampleEvents()

	// Seed sample users
	seedSampleUsers()

	log.Println("Database seeding completed successfully!")
}

func seedAdminUser() {
	userCollection := utils.GetCollection("users")

	// Check if admin already exists
	var existingUser models.User
	err := userCollection.FindOne(context.Background(), bson.M{"email": config.AppConfig.Admin.Email}).Decode(&existingUser)
	if err == nil {
		log.Println("Admin user already exists, skipping...")
		return
	}

	// Create admin user
	admin := models.User{
		Name:      "System Admin",
		Email:     config.AppConfig.Admin.Email,
		Phone:     config.AppConfig.Admin.Phone,
		Password:  config.AppConfig.Admin.Password,
		Role:      "admin",
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Hash password
	if err := admin.HashPassword(); err != nil {
		log.Fatal("Failed to hash admin password:", err)
	}

	// Insert admin user
	result, err := userCollection.InsertOne(context.Background(), admin)
	if err != nil {
		log.Fatal("Failed to create admin user:", err)
	}

	admin.ID = result.InsertedID.(primitive.ObjectID)
	log.Printf("Admin user created with ID: %s", admin.ID.Hex())
}

func seedSampleUsers() {
	userCollection := utils.GetCollection("users")

	sampleUsers := []models.User{
		{
			Name:      "John Doe",
			Email:     "john@example.com",
			Phone:     "+1234567890",
			Password:  "password123",
			Role:      "user",
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			Name:      "Jane Smith",
			Email:     "jane@example.com",
			Phone:     "+1234567891",
			Password:  "password123",
			Role:      "organizer",
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			Name:      "Bob Wilson",
			Email:     "bob@example.com",
			Phone:     "+1234567892",
			Password:  "password123",
			Role:      "user",
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	for _, user := range sampleUsers {
		// Check if user already exists
		var existingUser models.User
		err := userCollection.FindOne(context.Background(), bson.M{"email": user.Email}).Decode(&existingUser)
		if err == nil {
			log.Printf("User %s already exists, skipping...", user.Email)
			continue
		}

		// Hash password
		if err := user.HashPassword(); err != nil {
			log.Printf("Failed to hash password for %s: %v", user.Email, err)
			continue
		}

		// Insert user
		result, err := userCollection.InsertOne(context.Background(), user)
		if err != nil {
			log.Printf("Failed to create user %s: %v", user.Email, err)
			continue
		}

		user.ID = result.InsertedID.(primitive.ObjectID)
		log.Printf("User %s created with ID: %s", user.Email, user.ID.Hex())
	}
}

func seedSampleEvents() {
	eventCollection := utils.GetCollection("events")
	userCollection := utils.GetCollection("users")

	// Get organizer user
	var organizer models.User
	err := userCollection.FindOne(context.Background(), bson.M{"email": "jane@example.com"}).Decode(&organizer)
	if err != nil {
		log.Println("Organizer user not found, skipping event creation...")
		return
	}

	sampleEvents := []models.Event{
		{
			Title:       "Summer Music Festival",
			Description: "A fantastic summer music festival featuring top artists from around the world. Join us for an unforgettable experience with great music, food, and entertainment.",
			Date:        time.Now().AddDate(0, 2, 0), // 2 months from now
			Location:    "Central Park, New York",
			Price:       75.00,
			MaxTickets:  1000,
			SoldTickets: 0,
			Status:      "active",
			Category:    "music",
			ImageURL:    "https://example.com/summer-festival.jpg",
			OrganizerID: organizer.ID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			Title:       "Tech Conference 2024",
			Description: "The biggest tech conference of the year featuring keynote speakers, workshops, and networking opportunities. Learn about the latest trends in technology.",
			Date:        time.Now().AddDate(0, 1, 15), // 1.5 months from now
			Location:    "Convention Center, San Francisco",
			Price:       150.00,
			MaxTickets:  500,
			SoldTickets: 0,
			Status:      "active",
			Category:    "technology",
			ImageURL:    "https://example.com/tech-conference.jpg",
			OrganizerID: organizer.ID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			Title:       "Food & Wine Festival",
			Description: "Experience the finest cuisines and wines from renowned chefs and wineries. A culinary journey you won't want to miss.",
			Date:        time.Now().AddDate(0, 3, 0), // 3 months from now
			Location:    "Downtown Plaza, Los Angeles",
			Price:       120.00,
			MaxTickets:  300,
			SoldTickets: 0,
			Status:      "active",
			Category:    "food",
			ImageURL:    "https://example.com/food-festival.jpg",
			OrganizerID: organizer.ID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			Title:       "Comedy Night",
			Description: "A night of laughter with top comedians from the comedy circuit. Perfect for a fun evening out with friends.",
			Date:        time.Now().AddDate(0, 0, 7), // 1 week from now
			Location:    "Comedy Club, Chicago",
			Price:       45.00,
			MaxTickets:  200,
			SoldTickets: 0,
			Status:      "active",
			Category:    "entertainment",
			ImageURL:    "https://example.com/comedy-night.jpg",
			OrganizerID: organizer.ID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			Title:       "Art Exhibition",
			Description: "Contemporary art exhibition featuring works from emerging and established artists. A cultural experience for art enthusiasts.",
			Date:        time.Now().AddDate(0, 1, 0), // 1 month from now
			Location:    "Modern Art Museum, Miami",
			Price:       35.00,
			MaxTickets:  400,
			SoldTickets: 0,
			Status:      "active",
			Category:    "art",
			ImageURL:    "https://example.com/art-exhibition.jpg",
			OrganizerID: organizer.ID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	for _, event := range sampleEvents {
		// Check if event already exists
		var existingEvent models.Event
		err := eventCollection.FindOne(context.Background(), bson.M{"title": event.Title}).Decode(&existingEvent)
		if err == nil {
			log.Printf("Event %s already exists, skipping...", event.Title)
			continue
		}

		// Insert event
		result, err := eventCollection.InsertOne(context.Background(), event)
		if err != nil {
			log.Printf("Failed to create event %s: %v", event.Title, err)
			continue
		}

		event.ID = result.InsertedID.(primitive.ObjectID)
		log.Printf("Event %s created with ID: %s", event.Title, event.ID.Hex())
	}
} 