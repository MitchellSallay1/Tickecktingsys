package utils

import (
	"context"
	"log"
	"time"

	"eventticketing/config"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

// ConnectDB establishes connection to MongoDB
func ConnectDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(config.AppConfig.Database.URI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Ping the database
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	DB = client.Database(config.AppConfig.Database.DB)
	log.Println("Connected to MongoDB successfully")
}

// DisconnectDB closes the MongoDB connection
func DisconnectDB() {
	if DB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := DB.Client().Disconnect(ctx); err != nil {
			log.Println("Error disconnecting from MongoDB:", err)
		} else {
			log.Println("Disconnected from MongoDB successfully")
		}
	}
}

// GetCollection returns a MongoDB collection
func GetCollection(collectionName string) *mongo.Collection {
	return DB.Collection(collectionName)
}

// CreateIndexes creates indexes for better query performance
func CreateIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// User indexes
	userCollection := GetCollection("users")
	_, err := userCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"email": 1,
		},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Println("Error creating user email index:", err)
	}

	_, err = userCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"phone": 1,
		},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Println("Error creating user phone index:", err)
	}

	// Event indexes
	eventCollection := GetCollection("events")
	_, err = eventCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"organizer_id": 1,
		},
	})
	if err != nil {
		log.Println("Error creating event organizer index:", err)
	}

	_, err = eventCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"status": 1,
		},
	})
	if err != nil {
		log.Println("Error creating event status index:", err)
	}

	_, err = eventCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"date": 1,
		},
	})
	if err != nil {
		log.Println("Error creating event date index:", err)
	}

	// Ticket indexes
	ticketCollection := GetCollection("tickets")
	_, err = ticketCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"ticket_code": 1,
		},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Println("Error creating ticket code index:", err)
	}

	_, err = ticketCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"user_id": 1,
		},
	})
	if err != nil {
		log.Println("Error creating ticket user index:", err)
	}

	_, err = ticketCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"event_id": 1,
		},
	})
	if err != nil {
		log.Println("Error creating ticket event index:", err)
	}

	// Payment indexes
	paymentCollection := GetCollection("payments")
	_, err = paymentCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"user_id": 1,
		},
	})
	if err != nil {
		log.Println("Error creating payment user index:", err)
	}

	_, err = paymentCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"momo_ref": 1,
		},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Println("Error creating payment momo_ref index:", err)
	}

	log.Println("Database indexes created successfully")
} 