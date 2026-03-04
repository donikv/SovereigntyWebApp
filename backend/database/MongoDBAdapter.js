const { MongoClient, ObjectId } = require('mongodb');
const DatabaseAdapter = require('./DatabaseAdapter');

/**
 * MongoDB Database Adapter
 * Implementation of DatabaseAdapter for MongoDB
 */
class MongoDBAdapter extends DatabaseAdapter {
  constructor(connectionString, databaseName = 'sovereignty_db') {
    super();
    this.connectionString = connectionString;
    this.databaseName = databaseName;
    this.client = null;
    this.db = null;
    this.connected = false;
  }

  /**
   * Initialize MongoDB connection
   */
  async connect() {
    try {
      this.client = new MongoClient(this.connectionString);
      
      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      this.connected = true;
      
      // Create indexes for better query performance
      try {
        await this._createIndexes();
      } catch (indexError) {
        console.warn('Warning: Could not create indexes:', indexError.message);
        console.warn('Database will work but may have slower queries');
      }
      
      console.log(`Connected to MongoDB: ${this.databaseName}`);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Create database indexes
   */
  async _createIndexes() {
    const evaluationsCollection = this.db.collection('evaluations');
    
    // Index on technologyName for faster searches
    await evaluationsCollection.createIndex({ technologyName: 'text', description: 'text' });
    
    // Index on createdAt for sorting
    await evaluationsCollection.createIndex({ createdAt: -1 });
    
    // Index on overallScore for filtering
    await evaluationsCollection.createIndex({ 'results.overallScore': 1 });
  }

  /**
   * Close MongoDB connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.connected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  /**
   * Check connection status
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get the evaluations collection
   */
  _getCollection() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection('evaluations');
  }

  /**
   * Save a new evaluation
   */
  async saveEvaluation(evaluation) {
    const collection = this._getCollection();
    
    const document = {
      ...evaluation,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(document);
    
    return {
      ...document,
      _id: result.insertedId,
      id: result.insertedId.toString()
    };
  }

  /**
   * Get all evaluations with optional filtering
   */
  async getEvaluations(filter = {}, options = {}) {
    const collection = this._getCollection();
    
    const {
      limit = 100,
      skip = 0,
      sort = { createdAt: -1 }
    } = options;
    
    const cursor = collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const evaluations = await cursor.toArray();
    
    return evaluations.map(doc => ({
      ...doc,
      id: doc._id.toString()
    }));
  }

  /**
   * Get a single evaluation by ID
   */
  async getEvaluationById(id) {
    const collection = this._getCollection();
    
    try {
      const objectId = new ObjectId(id);
      const evaluation = await collection.findOne({ _id: objectId });
      
      if (!evaluation) {
        return null;
      }
      
      return {
        ...evaluation,
        id: evaluation._id.toString()
      };
    } catch (error) {
      console.error('Invalid ID format:', error);
      return null;
    }
  }

  /**
   * Update an evaluation
   */
  async updateEvaluation(id, updates) {
    const collection = this._getCollection();
    
    try {
      const objectId = new ObjectId(id);
      
      const result = await collection.findOneAndUpdate(
        { _id: objectId },
        { 
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        return null;
      }
      
      return {
        ...result.value,
        id: result.value._id.toString()
      };
    } catch (error) {
      console.error('Update failed:', error);
      return null;
    }
  }

  /**
   * Delete an evaluation
   */
  async deleteEvaluation(id) {
    const collection = this._getCollection();
    
    try {
      const objectId = new ObjectId(id);
      const result = await collection.deleteOne({ _id: objectId });
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  }

  /**
   * Get evaluation statistics
   */
  async getStatistics() {
    const collection = this._getCollection();
    
    const total = await collection.countDocuments();
    
    // Aggregate statistics
    const stats = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalEvaluations: { $sum: 1 },
          avgOverallScore: { $avg: '$results.overallScore' },
          avgSlcScore: { $avg: '$results.slcScore' },
          avgScScore: { $avg: '$results.scScore' },
          avgFinalScore: { $avg: '$results.finalScore' }
        }
      }
    ]).toArray();
    
    const scoreDistribution = await collection.aggregate([
      {
        $bucket: {
          groupBy: '$results.finalScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]).toArray();
    
    return {
      total,
      averageScores: stats[0] || {
        avgOverallScore: 0,
        avgSlcScore: 0,
        avgScScore: 0,
        avgFinalScore: 0
      },
      scoreDistribution
    };
  }

  /**
   * Search evaluations by text
   */
  async searchEvaluations(searchTerm, options = {}) {
    const collection = this._getCollection();
    
    const {
      limit = 100,
      skip = 0
    } = options;
    
    const cursor = collection
      .find({ 
        $text: { $search: searchTerm }
      })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);
    
    const evaluations = await cursor.toArray();
    
    return evaluations.map(doc => ({
      ...doc,
      id: doc._id.toString()
    }));
  }

  /**
   * Export evaluations to JSON format
   * @param {Object} filter - Optional filter criteria
   * @returns {Promise<Array>} Array of evaluations
   */
  async exportEvaluations(filter = {}) {
    const evaluations = await this.getEvaluations(filter, { limit: 10000 });
    return evaluations;
  }

  /**
   * Get evaluations within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of evaluations
   */
  async getEvaluationsByDateRange(startDate, endDate) {
    const collection = this._getCollection();
    
    const evaluations = await collection
      .find({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return evaluations.map(doc => ({
      ...doc,
      id: doc._id.toString()
    }));
  }
}

module.exports = MongoDBAdapter;
