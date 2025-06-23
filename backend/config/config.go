package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	MoMo     MoMoConfig
	SMS      SMSConfig
	USSD     USSDConfig
	Upload   UploadConfig
	Admin    AdminConfig
	Features FeatureConfig
	CORS     CORSConfig
}

type ServerConfig struct {
	Port string
	Env  string
}

type DatabaseConfig struct {
	URI string
	DB  string
}

type JWTConfig struct {
	Secret string
	Expiry time.Duration
}

type MoMoConfig struct {
	APIKey      string
	APISecret   string
	Environment string
	CallbackURL string
}

type SMSConfig struct {
	APIKey    string
	APISecret string
	SenderID  string
}

type USSDConfig struct {
	Code           string
	SessionTimeout int
}

type UploadConfig struct {
	Path       string
	MaxFileSize int64
}

type AdminConfig struct {
	Email    string
	Password string
	Phone    string
}

type FeatureConfig struct {
	EnableUSSD bool
	EnableQR   bool
	EnableSMS  bool
	EnableEmail bool
	CommissionRate float64
}

type CORSConfig struct {
	AllowedOrigins []string
}

var AppConfig *Config

func LoadConfig() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	AppConfig = &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			URI: getEnv("MONGODB_URI", "mongodb://localhost:27017"),
			DB:  getEnv("MONGODB_DB", "eventticketing"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production"),
			Expiry: getDurationEnv("JWT_EXPIRY", 24*time.Hour),
		},
		MoMo: MoMoConfig{
			APIKey:      getEnv("MOMO_API_KEY", ""),
			APISecret:   getEnv("MOMO_API_SECRET", ""),
			Environment: getEnv("MOMO_ENVIRONMENT", "sandbox"),
			CallbackURL: getEnv("MOMO_CALLBACK_URL", "http://localhost:8080/api/payment/callback"),
		},
		SMS: SMSConfig{
			APIKey:    getEnv("SMS_API_KEY", ""),
			APISecret: getEnv("SMS_API_SECRET", ""),
			SenderID:  getEnv("SMS_SENDER_ID", "EventTix"),
		},
		USSD: USSDConfig{
			Code:           getEnv("USSD_CODE", "*123#"),
			SessionTimeout: getIntEnv("USSD_SESSION_TIMEOUT", 300),
		},
		Upload: UploadConfig{
			Path:       getEnv("UPLOAD_PATH", "./uploads"),
			MaxFileSize: getInt64Env("MAX_FILE_SIZE", 5242880), // 5MB
		},
		Admin: AdminConfig{
			Email:    getEnv("ADMIN_EMAIL", "admin@eventticketing.com"),
			Password: getEnv("ADMIN_PASSWORD", "admin123"),
			Phone:    getEnv("ADMIN_PHONE", "+1234567890"),
		},
		Features: FeatureConfig{
			EnableUSSD:      getBoolEnv("ENABLE_USSD", true),
			EnableQR:        getBoolEnv("ENABLE_QR", true),
			EnableSMS:       getBoolEnv("ENABLE_SMS", true),
			EnableEmail:     getBoolEnv("ENABLE_EMAIL", false),
			CommissionRate:  getFloatEnv("COMMISSION_RATE", 0.05),
		},
		CORS: CORSConfig{
			AllowedOrigins: getStringSliceEnv("ALLOWED_ORIGINS", []string{"http://localhost:3000", "http://localhost:3001"}),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getInt64Env(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getFloatEnv(key string, defaultValue float64) float64 {
	if value := os.Getenv(key); value != "" {
		if floatValue, err := strconv.ParseFloat(value, 64); err == nil {
			return floatValue
		}
	}
	return defaultValue
}

func getBoolEnv(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getStringSliceEnv(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		// Simple comma-separated values
		// In production, you might want more sophisticated parsing
		return []string{value}
	}
	return defaultValue
} 