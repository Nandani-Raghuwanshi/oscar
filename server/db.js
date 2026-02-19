const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'builtcred';

let client;
let db;

async function connectToDb() {
    client = new MongoClient(MONGO_URI, {});
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB', MONGO_URI, DB_NAME);
}

function getDb() {
    if (!db) throw new Error('Database not connected');
    return db;
}

module.exports = { connectToDb, getDb, client };
