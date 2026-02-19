const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectToDb } = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const projectRoutes = require('./routes/project');
const advocateRoutes = require('./routes/advocate');
const referralRoutes = require('./routes/referral');
const rewardRoutes = require('./routes/reward');

app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/advocates', advocateRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/rewards', rewardRoutes);

// Error handlers
app.use((req, res) => {
    res.status(404).json({ error: 'Resource not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

connectToDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to DB', err);
        process.exit(1);
    });
