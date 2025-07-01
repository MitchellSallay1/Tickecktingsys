package services

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type WebSocketService struct {
	clients    map[*websocket.Conn]ClientInfo
	broadcast  chan Message
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mutex      sync.RWMutex
}

type ClientInfo struct {
	UserID   string `json:"user_id"`
	Role     string `json:"role"`
	EventID  string `json:"event_id,omitempty"`
	JoinedAt time.Time
}

type Message struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	UserID    string      `json:"user_id,omitempty"`
	EventID   string      `json:"event_id,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

type NotificationData struct {
	Title       string `json:"title"`
	Message     string `json:"message"`
	Action      string `json:"action,omitempty"`
	ActionURL   string `json:"action_url,omitempty"`
	Priority    string `json:"priority"` // low, medium, high, urgent
	Category    string `json:"category"` // ticket, payment, event, system
}

type LiveEventData struct {
	EventID     string `json:"event_id"`
	TicketsSold int    `json:"tickets_sold"`
	Revenue     float64 `json:"revenue"`
	Attendees   int    `json:"attendees"`
	LastUpdated time.Time `json:"last_updated"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // In production, implement proper origin checking
	},
}

func NewWebSocketService() *WebSocketService {
	return &WebSocketService{
		clients:    make(map[*websocket.Conn]ClientInfo),
		broadcast:  make(chan Message),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (ws *WebSocketService) Start() {
	for {
		select {
		case client := <-ws.register:
			ws.mutex.Lock()
			ws.clients[client] = ClientInfo{JoinedAt: time.Now()}
			ws.mutex.Unlock()
			log.Printf("Client connected. Total clients: %d", len(ws.clients))

		case client := <-ws.unregister:
			ws.mutex.Lock()
			delete(ws.clients, client)
			ws.mutex.Unlock()
			log.Printf("Client disconnected. Total clients: %d", len(ws.clients))

		case message := <-ws.broadcast:
			ws.mutex.RLock()
			for client, info := range ws.clients {
				// Send to specific user if specified
				if message.UserID != "" && info.UserID != message.UserID {
					continue
				}
				// Send to specific event if specified
				if message.EventID != "" && info.EventID != message.EventID {
					continue
				}

				err := client.WriteJSON(message)
				if err != nil {
					log.Printf("Error sending message to client: %v", err)
					client.Close()
					delete(ws.clients, client)
				}
			}
			ws.mutex.RUnlock()
		}
	}
}

func (ws *WebSocketService) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	// Register client
	ws.register <- conn

	// Handle incoming messages
	go func() {
		defer func() {
			ws.unregister <- conn
			conn.Close()
		}()

		for {
			var msg map[string]interface{}
			err := conn.ReadJSON(&msg)
			if err != nil {
				log.Printf("Error reading message: %v", err)
				break
			}

			// Handle different message types
			switch msg["type"] {
			case "auth":
				ws.handleAuth(conn, msg)
			case "subscribe_event":
				ws.handleSubscribeEvent(conn, msg)
			case "unsubscribe_event":
				ws.handleUnsubscribeEvent(conn, msg)
			case "ping":
				conn.WriteJSON(map[string]string{"type": "pong"})
			}
		}
	}()
}

func (ws *WebSocketService) handleAuth(conn *websocket.Conn, msg map[string]interface{}) {
	ws.mutex.Lock()
	defer ws.mutex.Unlock()

	if client, exists := ws.clients[conn]; exists {
		if userID, ok := msg["user_id"].(string); ok {
			client.UserID = userID
		}
		if role, ok := msg["role"].(string); ok {
			client.Role = role
		}
		ws.clients[conn] = client
	}
}

func (ws *WebSocketService) handleSubscribeEvent(conn *websocket.Conn, msg map[string]interface{}) {
	ws.mutex.Lock()
	defer ws.mutex.Unlock()

	if client, exists := ws.clients[conn]; exists {
		if eventID, ok := msg["event_id"].(string); ok {
			client.EventID = eventID
			ws.clients[conn] = client
		}
	}
}

func (ws *WebSocketService) handleUnsubscribeEvent(conn *websocket.Conn, msg map[string]interface{}) {
	ws.mutex.Lock()
	defer ws.mutex.Unlock()

	if client, exists := ws.clients[conn]; exists {
		client.EventID = ""
		ws.clients[conn] = client
	}
}

// BroadcastNotification sends a notification to all connected clients or specific users
func (ws *WebSocketService) BroadcastNotification(notification NotificationData, userID string, eventID string) {
	message := Message{
		Type:      "notification",
		Data:      notification,
		UserID:    userID,
		EventID:   eventID,
		Timestamp: time.Now(),
	}
	ws.broadcast <- message
}

// BroadcastLiveEventData sends live event updates to subscribed clients
func (ws *WebSocketService) BroadcastLiveEventData(eventData LiveEventData) {
	message := Message{
		Type:      "live_event_update",
		Data:      eventData,
		EventID:   eventData.EventID,
		Timestamp: time.Now(),
	}
	ws.broadcast <- message
}

// BroadcastTicketPurchase sends ticket purchase notification
func (ws *WebSocketService) BroadcastTicketPurchase(eventID, eventTitle string, ticketCount int, revenue float64) {
	// Notify event organizers
	notification := NotificationData{
		Title:    "New Ticket Purchase",
		Message:  fmt.Sprintf("%d tickets sold for %s", ticketCount, eventTitle),
		Action:   "View Details",
		ActionURL: fmt.Sprintf("/events/%s/tickets", eventID),
		Priority: "medium",
		Category: "ticket",
	}
	ws.BroadcastNotification(notification, "", eventID)

	// Broadcast live event data
	liveData := LiveEventData{
		EventID:     eventID,
		TicketsSold: ticketCount,
		Revenue:     revenue,
		LastUpdated: time.Now(),
	}
	ws.BroadcastLiveEventData(liveData)
}

// BroadcastLowTicketAlert sends low ticket alert to organizers
func (ws *WebSocketService) BroadcastLowTicketAlert(eventID, eventTitle string, remainingTickets int) {
	notification := NotificationData{
		Title:    "Low Ticket Alert",
		Message:  fmt.Sprintf("Only %d tickets remaining for %s", remainingTickets, eventTitle),
		Action:   "View Event",
		ActionURL: fmt.Sprintf("/events/%s", eventID),
		Priority: "high",
		Category: "event",
	}
	ws.BroadcastNotification(notification, "", eventID)
}

// BroadcastPaymentStatus sends payment status updates
func (ws *WebSocketService) BroadcastPaymentStatus(userID, eventTitle, status string, amount float64) {
	notification := NotificationData{
		Title:    "Payment " + status,
		Message:  fmt.Sprintf("Payment of $%.2f for %s has been %s", amount, eventTitle, status),
		Action:   "View Tickets",
		ActionURL: "/user/tickets",
		Priority: "medium",
		Category: "payment",
	}
	ws.BroadcastNotification(notification, userID, "")
}

// GetConnectedClientsCount returns the number of connected clients
func (ws *WebSocketService) GetConnectedClientsCount() int {
	ws.mutex.RLock()
	defer ws.mutex.RUnlock()
	return len(ws.clients)
}

// GetClientsByEvent returns clients subscribed to a specific event
func (ws *WebSocketService) GetClientsByEvent(eventID string) []ClientInfo {
	ws.mutex.RLock()
	defer ws.mutex.RUnlock()
	
	var clients []ClientInfo
	for _, client := range ws.clients {
		if client.EventID == eventID {
			clients = append(clients, client)
		}
	}
	return clients
} 