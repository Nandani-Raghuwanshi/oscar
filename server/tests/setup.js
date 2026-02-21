import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Setup: Start in-memory MongoDB before all tests
beforeAll(async () => {
    // Disconnect from any existing connection
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
}, 120000); // 2 minutes timeout for MongoDB setup

// Cleanup: Clear database between tests
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// Teardown: Stop MongoDB and close connection after all tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
}, 60000); // 1 minute timeout for teardown
