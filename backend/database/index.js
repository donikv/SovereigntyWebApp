/**
 * Database index file
 * Exports all database-related modules
 */

const DatabaseAdapter = require('./DatabaseAdapter');
const MongoDBAdapter = require('./MongoDBAdapter');
const DatabaseFactory = require('./DatabaseFactory');

module.exports = {
  DatabaseAdapter,
  MongoDBAdapter,
  DatabaseFactory
};
