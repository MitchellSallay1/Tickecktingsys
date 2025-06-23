// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the eventticketing database
db = db.getSiblingDB('eventticketing');

// Create collections
db.createCollection('users');
db.createCollection('events');
db.createCollection('tickets');
db.createCollection('payments');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "is_active": 1 });

db.events.createIndex({ "organizer_id": 1 });
db.events.createIndex({ "status": 1 });
db.events.createIndex({ "date": 1 });
db.events.createIndex({ "category": 1 });
db.events.createIndex({ "title": "text", "description": "text" });

db.tickets.createIndex({ "ticket_code": 1 }, { unique: true });
db.tickets.createIndex({ "user_id": 1 });
db.tickets.createIndex({ "event_id": 1 });
db.tickets.createIndex({ "status": 1 });
db.tickets.createIndex({ "created_at": 1 });

db.payments.createIndex({ "user_id": 1 });
db.payments.createIndex({ "event_id": 1 });
db.payments.createIndex({ "status": 1 });
db.payments.createIndex({ "payment_type": 1 });
db.payments.createIndex({ "momo_ref": 1 }, { unique: true, sparse: true });
db.payments.createIndex({ "created_at": 1 });

print('MongoDB initialization completed successfully!');
print('Database: eventticketing');
print('Collections created: users, events, tickets, payments');
print('Indexes created for optimal performance'); 