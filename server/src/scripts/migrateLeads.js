
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import Lead from '../models/Lead.js';

async function migrateLeads() {
    try {
        await connectDB();
        console.log('Connected to database');
        
        console.log('Starting Lead migration...');
        
        // Add default values for new fields to all existing leads
        const result = await Lead.updateMany(
            {
                $or: [
                    { escalationStage: { $exists: false } },
                    { siteVisitScheduled: { $exists: false } },
                    { escalationHistory: { $exists: false } }
                ]
            },
            {
                $set: {
                    escalationStage: 0,
                    siteVisitScheduled: false
                },
                $setOnInsert: {
                    escalationHistory: []
                }
            }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} leads with new fields`);
        console.log(`   - escalationStage: 0`);
        console.log(`   - siteVisitScheduled: false`);
        console.log(`   - escalationHistory: []`);
        
        // Count leads by status
        const statusCounts = await Lead.aggregate([
            { $match: { deletedAt: null } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\nLead Status Distribution:');
        statusCounts.forEach(item => {
            console.log(`   ${item._id}: ${item.count}`);
        });
        
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error migrating leads:', error);
        console.error('Error details:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

migrateLeads();