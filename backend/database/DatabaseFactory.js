const MongoDBAdapter = require('./MongoDBAdapter');

/**
 * Database Factory
 * Creates and manages database adapter instances
 */
class DatabaseFactory {
  static instance = null;
  static adapter = null;

  /**
   * Get or create database adapter instance
   * @param {string} type - Database type ('mongodb', 'postgresql', etc.)
   * @param {Object} config - Database configuration
   * @returns {DatabaseAdapter} Database adapter instance
   */
  static async createAdapter(type = 'mongodb', config = {}) {
    // Return existing adapter if already created
    if (this.adapter && this.adapter.isConnected()) {
      return this.adapter;
    }

    switch (type.toLowerCase()) {
      case 'mongodb':
        const connectionString = config.connectionString || 
                                process.env.MONGODB_URI || 
                                'mongodb://localhost:27017';
        const databaseName = config.databaseName || 
                            process.env.MONGODB_DB_NAME || 
                            'sovereignty_db';
        
        this.adapter = new MongoDBAdapter(connectionString, databaseName);
        await this.adapter.connect();
        return this.adapter;
      
      // Add more database types here as needed
      // case 'postgresql':
      //   this.adapter = new PostgreSQLAdapter(config);
      //   await this.adapter.connect();
      //   return this.adapter;
      
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  /**
   * Get the current adapter instance
   * @returns {DatabaseAdapter|null}
   */
  static getAdapter() {
    return this.adapter;
  }

  /**
   * Close database connection
   */
  static async closeConnection() {
    if (this.adapter) {
      await this.adapter.disconnect();
      this.adapter = null;
    }
  }
}

module.exports = DatabaseFactory;
