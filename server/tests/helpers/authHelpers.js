import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

/**
 * Generate JWT token for testing
 */
export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

/**
 * Create auth header with token
 */
export const authHeader = (token) => {
    return { Authorization: `Bearer ${token}` };
};

/**
 * Login helper that returns token
 */
export const loginUser = async (request, email, password) => {
    const response = await request
        .post('/api/auth/login')
        .send({ email, password });

    return response.body.token;
};
