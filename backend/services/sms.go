package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"eventticketing/config"
)

type SMSService struct {
	apiKey    string
	apiSecret string
	senderID  string
	baseURL   string
}

type SMSRequest struct {
	To      string `json:"to"`
	From    string `json:"from"`
	Message string `json:"message"`
}

type SMSResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	ID      string `json:"id"`
}

func NewSMSService() *SMSService {
	return &SMSService{
		apiKey:    config.AppConfig.SMS.APIKey,
		apiSecret: config.AppConfig.SMS.APISecret,
		senderID:  config.AppConfig.SMS.SenderID,
		baseURL:   "https://api.mtn.com/sms/v1", // Replace with actual MTN SMS API URL
	}
}

// SendSMS sends an SMS message
func (ss *SMSService) SendSMS(to, message string) error {
	// Create SMS request
	smsReq := SMSRequest{
		To:      to,
		From:    ss.senderID,
		Message: message,
	}

	// Convert to JSON
	jsonData, err := json.Marshal(smsReq)
	if err != nil {
		return fmt.Errorf("failed to marshal SMS request: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", ss.baseURL+"/messages", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %w", err)
	}

	// Add headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", ss.apiKey))
	req.Header.Set("X-API-Key", ss.apiSecret)

	// Make request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send SMS: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("SMS API returned status: %d", resp.StatusCode)
	}

	// Parse response
	var smsResp SMSResponse
	if err := json.NewDecoder(resp.Body).Decode(&smsResp); err != nil {
		return fmt.Errorf("failed to decode SMS response: %w", err)
	}

	// Check if SMS was sent successfully
	if smsResp.Status != "success" {
		return fmt.Errorf("SMS failed: %s", smsResp.Message)
	}

	return nil
}

// SendBulkSMS sends SMS messages to multiple recipients
func (ss *SMSService) SendBulkSMS(recipients []string, message string) error {
	for _, recipient := range recipients {
		if err := ss.SendSMS(recipient, message); err != nil {
			// Log error but continue with other recipients
			fmt.Printf("Failed to send SMS to %s: %v\n", recipient, err)
		}
		// Add delay between SMS to avoid rate limiting
		time.Sleep(100 * time.Millisecond)
	}
	return nil
}

// SendTicketConfirmation sends ticket confirmation SMS
func (ss *SMSService) SendTicketConfirmation(phoneNumber, eventTitle, ticketCode, eventDate string) error {
	message := fmt.Sprintf("Your ticket for %s has been confirmed. Ticket Code: %s. Event Date: %s. Thank you for using EventTix!", 
		eventTitle, ticketCode, eventDate)
	
	return ss.SendSMS(phoneNumber, message)
}

// SendPaymentReminder sends payment reminder SMS
func (ss *SMSService) SendPaymentReminder(phoneNumber, eventTitle, amount string) error {
	message := fmt.Sprintf("Payment reminder: Your ticket for %s is pending. Amount: %s. Please complete payment to confirm your ticket.", 
		eventTitle, amount)
	
	return ss.SendSMS(phoneNumber, message)
} 