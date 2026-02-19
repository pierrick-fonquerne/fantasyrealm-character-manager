// Initialize activity_logs collection with indexes for the FantasyRealm platform.
// This script runs automatically on first MongoDB container startup.

db = db.getSiblingDB(process.env.MONGO_DB || "fantasyrealm_logs");

db.createCollection("activity_logs");

db.activity_logs.createIndex({ timestamp: -1 }, { name: "idx_timestamp_desc" });
db.activity_logs.createIndex({ action: 1 }, { name: "idx_action" });
db.activity_logs.createIndex({ action: 1, timestamp: -1 }, { name: "idx_action_timestamp" });

print("MongoDB initialization complete: activity_logs collection and indexes created.");
