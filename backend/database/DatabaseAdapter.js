/**
 * Database Adapter Interface
 * Abstract class defining the database operations interface
 * This allows for easy migration between different database systems
 */

class DatabaseAdapter {
  /**
   * Initialize the database connection
   * @returns {Promise<void>}
   */
  async connect() {
    throw new Error('Method connect() must be implemented');
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('Method disconnect() must be implemented');
  }

  /**
   * Check if the database is connected
   * @returns {boolean}
   */
  isConnected() {
    throw new Error('Method isConnected() must be implemented');
  }

  /**
   * Save a new evaluation
   * @param {Object} evaluation - The evaluation data to save
   * @returns {Promise<Object>} The saved evaluation with id
   */
  async saveEvaluation(evaluation) {
    throw new Error('Method saveEvaluation() must be implemented');
  }

  /**
   * Get all evaluations
   * @param {Object} filter - Optional filter criteria
   * @param {Object} options - Optional query options (limit, skip, sort)
   * @returns {Promise<Array>} Array of evaluations
   */
  async getEvaluations(filter = {}, options = {}) {
    throw new Error('Method getEvaluations() must be implemented');
  }

  /**
   * Get a single evaluation by ID
   * @param {string} id - The evaluation ID
   * @returns {Promise<Object|null>} The evaluation or null if not found
   */
  async getEvaluationById(id) {
    throw new Error('Method getEvaluationById() must be implemented');
  }

  /**
   * Update an evaluation
   * @param {string} id - The evaluation ID
   * @param {Object} updates - The fields to update
   * @returns {Promise<Object|null>} The updated evaluation or null if not found
   */
  async updateEvaluation(id, updates) {
    throw new Error('Method updateEvaluation() must be implemented');
  }

  /**
   * Delete an evaluation
   * @param {string} id - The evaluation ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteEvaluation(id) {
    throw new Error('Method deleteEvaluation() must be implemented');
  }

  /**
   * Get evaluation statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    throw new Error('Method getStatistics() must be implemented');
  }

  /**
   * Search evaluations
   * @param {string} searchTerm - The search term
   * @param {Object} options - Optional query options
   * @returns {Promise<Array>} Array of matching evaluations
   */
  async searchEvaluations(searchTerm, options = {}) {
    throw new Error('Method searchEvaluations() must be implemented');
  }
}

module.exports = DatabaseAdapter;
