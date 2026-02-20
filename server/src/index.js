import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import projectRoutes from './routes/projects.js';
import builderRoutes from './routes/builder.js';
import advocateRoutes from './routes/advocate.js';
import brandRoutes from './routes/brand.js';
import crmRoutes from './routes/crm.js';
import { checkAndEscalateReferrals } from './utils/autoEscalation.js';
import morgan from 'morgan';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
// Connect Database
await connectDB();

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/advocate', advocateRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/crm', crmRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Start auto-escalation cron job (runs every hour)
    console.log('Starting auto-escalation cron job...');
    setInterval(async () => {
        try {
            console.log('Running auto-escalation check...');
            await checkAndEscalateReferrals();
            console.log('Auto-escalation check completed');
        } catch (error) {
            console.error('Auto-escalation error:', error);
        }
    }, 60 * 60 * 1000); // Run every hour
    
    // Run immediately on startup
    setTimeout(async () => {
        try {
            console.log('Running initial auto-escalation check...');
            await checkAndEscalateReferrals();
            console.log('Initial auto-escalation check completed');
        } catch (error) {
            console.error('Initial auto-escalation error:', error);
        }
    }, 5000); // Run 5 seconds after startup
});
