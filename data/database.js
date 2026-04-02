const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
// Force to use IPv4 to avoid DNS resolution issues with MongoDB Atlas

const { MongoClient } = require('mongodb');

let database;

const initDb = async (callback) => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URL, {
      family: 4
    });
    database = client.db();
    callback();
  } catch (err) {
    callback(err);
  }
};

const getDatabase = () => {
  if (!database) {
    throw Error('Database not initialized!');
  }
  return database;
};

module.exports = { initDb, getDatabase };