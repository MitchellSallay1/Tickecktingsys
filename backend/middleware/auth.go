package middleware

import (
	"context"
	"net/http"
	"strings"

	"eventticketing/models"
	"eventticketing/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AuthMiddleware struct {
	userCollection *mongo.Collection
}

func NewAuthMiddleware() *AuthMiddleware {
	return &AuthMiddleware{
		userCollection: utils.GetCollection("users"),
	}
}

// AuthMiddleware validates JWT token and sets user in context
func (am *AuthMiddleware) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString, err := utils.ExtractTokenFromHeader(authHeader)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Get user from database
		var user models.User
		err = am.userCollection.FindOne(context.Background(), bson.M{"_id": claims.UserID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		if !user.IsActive {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User account is deactivated"})
			c.Abort()
			return
		}

		// Set user in context
		c.Set("user", &user)
		c.Next()
	}
}

// RequireRole middleware checks if user has required role
func (am *AuthMiddleware) RequireRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userInterface, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		user, ok := userInterface.(*models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user data"})
			c.Abort()
			return
		}

		if !user.CanAccess(requiredRole) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAdmin middleware checks if user is admin
func (am *AuthMiddleware) RequireAdmin() gin.HandlerFunc {
	return am.RequireRole("admin")
}

// RequireOrganizer middleware checks if user is organizer or admin
func (am *AuthMiddleware) RequireOrganizer() gin.HandlerFunc {
	return am.RequireRole("organizer")
}

// RequireUser middleware checks if user is authenticated
func (am *AuthMiddleware) RequireUser() gin.HandlerFunc {
	return am.RequireRole("user")
}

// OptionalAuth middleware validates JWT token if present but doesn't require it
func (am *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		tokenString, err := utils.ExtractTokenFromHeader(authHeader)
		if err != nil {
			c.Next()
			return
		}

		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.Next()
			return
		}

		// Get user from database
		var user models.User
		err = am.userCollection.FindOne(context.Background(), bson.M{"_id": claims.UserID}).Decode(&user)
		if err != nil {
			c.Next()
			return
		}

		if !user.IsActive {
			c.Next()
			return
		}

		// Set user in context
		c.Set("user", &user)
		c.Next()
	}
}

// GetUserFromContext gets user from gin context
func GetUserFromContext(c *gin.Context) (*models.User, bool) {
	userInterface, exists := c.Get("user")
	if !exists {
		return nil, false
	}

	user, ok := userInterface.(*models.User)
	return user, ok
}

// GetUserIDFromContext gets user ID from gin context
func GetUserIDFromContext(c *gin.Context) (primitive.ObjectID, bool) {
	user, exists := GetUserFromContext(c)
	if !exists {
		return primitive.NilObjectID, false
	}
	return user.ID, true
} 