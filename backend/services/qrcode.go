package services

import (
	"encoding/base64"
	"fmt"

	"github.com/skip2/go-qrcode"
)

type QRService struct{}

func NewQRService() *QRService {
	return &QRService{}
}

// GenerateQRCode generates a QR code for the given ticket code
func (qs *QRService) GenerateQRCode(ticketCode string) (string, error) {
	// Generate QR code as PNG
	png, err := qrcode.Encode(ticketCode, qrcode.Medium, 256)
	if err != nil {
		return "", fmt.Errorf("failed to generate QR code: %w", err)
	}

	// Convert to base64
	base64String := base64.StdEncoding.EncodeToString(png)
	return fmt.Sprintf("data:image/png;base64,%s", base64String), nil
}

// GenerateQRCodeFile generates a QR code and saves it to a file
func (qs *QRService) GenerateQRCodeFile(ticketCode, filePath string) error {
	err := qrcode.WriteFile(ticketCode, qrcode.Medium, 256, filePath)
	if err != nil {
		return fmt.Errorf("failed to generate QR code file: %w", err)
	}
	return nil
} 