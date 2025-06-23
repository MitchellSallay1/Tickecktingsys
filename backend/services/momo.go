package services

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"eventticketing/config"
	"eventticketing/models"
)

type MoMoService struct {
	apiKey    string
	apiSecret string
	baseURL   string
}

type MoMoRequest struct {
	Amount      string `json:"amount"`
	Currency    string `json:"currency"`
	ExternalID  string `json:"externalId"`
	Payer       Payer  `json:"payer"`
	PayerMessage string `json:"payerMessage"`
	PayeeNote   string `json:"payeeNote"`
}

type Payer struct {
	PartyIDType string `json:"partyIdType"`
	PartyID     string `json:"partyId"`
}

type MoMoResponse struct {
	Status     string `json:"status"`
	Message    string `json:"message"`
	Reference  string `json:"reference"`
	RequestID  string `json:"requestId"`
	CollectionID string `json:"collectionId"`
}

func NewMoMoService() *MoMoService {
	baseURL := "https://sandbox.momodeveloper.mtn.com"
	if config.AppConfig.MoMo.Environment == "production" {
		baseURL = "https://proxy.momoapi.mtn.com"
	}

	return &MoMoService{
		apiKey:    config.AppConfig.MoMo.APIKey,
		apiSecret: config.AppConfig.MoMo.APISecret,
		baseURL:   baseURL,
	}
}

// InitiatePayment initiates a MoMo payment
func (ms *MoMoService) InitiatePayment(payment *models.Payment, event *models.Event) (*MoMoResponse, error) {
	// Generate external ID
	externalID := fmt.Sprintf("TIX_%s_%d", payment.ID.Hex(), time.Now().Unix())

	// Create MoMo request
	momoReq := MoMoRequest{
		Amount:      strconv.FormatFloat(payment.Amount, 'f', 2, 64),
		Currency:    "EUR", // Change to your currency
		ExternalID:  externalID,
		Payer: Payer{
			PartyIDType: "MSISDN",
			PartyID:     payment.PhoneNumber,
		},
		PayerMessage: fmt.Sprintf("Payment for %s", event.Title),
		PayeeNote:    fmt.Sprintf("Ticket purchase for %s", event.Title),
	}

	// Convert to JSON
	jsonData, err := json.Marshal(momoReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal MoMo request: %w", err)
	}

	// Create HTTP request
	url := fmt.Sprintf("%s/collection/v1_0/requesttopay", ms.baseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}

	// Add headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", ms.apiKey))
	req.Header.Set("X-Reference-Id", externalID)
	req.Header.Set("X-Target-Environment", config.AppConfig.MoMo.Environment)

	// Add signature
	signature := ms.generateSignature(jsonData)
	req.Header.Set("X-Signature", signature)

	// Make request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make MoMo request: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var momoResp MoMoResponse
	if err := json.NewDecoder(resp.Body).Decode(&momoResp); err != nil {
		return nil, fmt.Errorf("failed to decode MoMo response: %w", err)
	}

	// Update payment with MoMo reference
	payment.MoMoRef = externalID

	return &momoResp, nil
}

// generateSignature generates HMAC signature for MoMo API
func (ms *MoMoService) generateSignature(data []byte) string {
	h := hmac.New(sha256.New, []byte(ms.apiSecret))
	h.Write(data)
	return hex.EncodeToString(h.Sum(nil))
}

// GetPaymentStatus checks the status of a MoMo payment
func (ms *MoMoService) GetPaymentStatus(referenceID string) (*MoMoResponse, error) {
	url := fmt.Sprintf("%s/collection/v1_0/requesttopay/%s", ms.baseURL, referenceID)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}

	// Add headers
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", ms.apiKey))
	req.Header.Set("X-Target-Environment", config.AppConfig.MoMo.Environment)

	// Make request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make MoMo request: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var momoResp MoMoResponse
	if err := json.NewDecoder(resp.Body).Decode(&momoResp); err != nil {
		return nil, fmt.Errorf("failed to decode MoMo response: %w", err)
	}

	return &momoResp, nil
} 