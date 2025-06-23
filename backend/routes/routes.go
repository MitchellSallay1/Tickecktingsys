package routes

import (
	"eventticketing/controllers"
	"eventticketing/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all the routes for the application
func SetupRoutes(router *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	// Initialize controllers
	authController := controllers.NewAuthController()
	eventController := controllers.NewEventController()
	ticketController := controllers.NewTicketController()
	paymentController := controllers.NewPaymentController()
	adminController := controllers.NewAdminController()
	ussdController := controllers.NewUSSDController()

	// API routes group
	api := router.Group("/api")
	{
		// Public routes (no authentication required)
		api.GET("/events", eventController.GetAllEvents)
		api.GET("/events/:id", eventController.GetEventByID)
		api.POST("/register", authController.Register)
		api.POST("/login", authController.Login)

		// USSD routes
		api.POST("/ussd/entry", ussdController.HandleUSSDEntry)

		// Payment callback (webhook)
		api.POST("/payment/callback", paymentController.HandleMoMoCallback)

		// Protected routes (authentication required)
		protected := api.Group("")
		protected.Use(authMiddleware.AuthMiddleware())
		{
			// User routes
			protected.GET("/me", authController.GetCurrentUser)
			protected.PUT("/me", authController.UpdateProfile)
			protected.GET("/user/tickets", ticketController.GetUserTickets)

			// Event routes (organizer/admin only)
			events := protected.Group("/events")
			events.Use(authMiddleware.RequireOrganizer())
			{
				events.POST("", eventController.CreateEvent)
				events.PUT("/:id", eventController.UpdateEvent)
				events.DELETE("/:id", eventController.DeleteEvent)
				events.GET("/organizer/events", eventController.GetOrganizerEvents)
			}

			// Ticket routes
			tickets := protected.Group("/tickets")
			{
				tickets.POST("", ticketController.CreateTicket)
				tickets.GET("/:id", ticketController.GetTicketByID)
				tickets.POST("/verify", ticketController.VerifyTicket)
			}

			// Payment routes
			payments := protected.Group("/payments")
			{
				payments.POST("/initiate", paymentController.InitiatePayment)
				payments.GET("", paymentController.GetPayments)
			}

			// Admin routes (admin only)
			admin := protected.Group("/admin")
			admin.Use(authMiddleware.RequireAdmin())
			{
				admin.GET("/dashboard", adminController.GetDashboard)
				admin.GET("/users", adminController.GetAllUsers)
				admin.PUT("/users/:id", adminController.UpdateUser)
				admin.GET("/events", adminController.GetAllEvents)
				admin.GET("/tickets", adminController.GetAllTickets)
				admin.GET("/payments", adminController.GetAllPayments)
				admin.GET("/settings", adminController.GetSettings)
				admin.PUT("/settings", adminController.UpdateSettings)
				admin.GET("/analytics", adminController.GetAnalytics)
			}
		}
	}

	// Serve static files (for uploaded images)
	router.Static("/uploads", "./uploads")
} 