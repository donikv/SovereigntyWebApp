// MongoDB initialization script
// This script runs when the MongoDB container is first created

db = db.getSiblingDB('sovereignty_db');

// Create application user with read/write permissions
db.createUser({
  user: 'sovuser',
  pwd: process.env.MONGO_USER_PASSWORD || 'sovpass123',
  roles: [
    {
      role: 'readWrite',
      db: 'sovereignty_db'
    }
  ]
});

// Create evaluations collection with indexes
db.createCollection('evaluations');

// Create indexes for better query performance
db.evaluations.createIndex({ createdAt: -1 }); // Sort by date
db.evaluations.createIndex({ technologyName: 'text', description: 'text' }); // Text search
db.evaluations.createIndex({ 'results.sovereignty.overallScore': -1 }); // Filter by score

print('Database initialization completed successfully!');
