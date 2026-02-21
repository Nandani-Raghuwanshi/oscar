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
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import escalationRulesRoutes from './routes/escalationRules.js';
import { startEscalationCron } from './jobs/escalationCron.js';
import morgan from 'morgan';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect Database (skip in test mode as tests use in-memory MongoDB)
if (process.env.NODE_ENV !== 'test') {
    await connectDB();
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/escalation-rules', escalationRulesRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/advocate', advocateRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Export app for testing
export default app;

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    // Start escalation cron job
    startEscalationCron();
    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
