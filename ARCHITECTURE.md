# System Architecture - BuiltCred

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client (Browser)                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  React + Vite                                           │   │
│  │  - Zustand State Management                            │   │
│  │  - Protected Routes                                    │   │
│  │  - Tailwind CSS UI                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────────┘
                  │ HTTP/REST + JWT Token
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                  API Server (Node.js/Express)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Routes                                                 │   │
│  │  - /api/auth/* (Authentication)                        │   │
│  │  - /api/users/* (User Management)                      │   │
│  │  - /api/projects/* (Projects)                          │   │
│  │  - /api/.../* (Other resources)                        │   │
│  └─────────────────┬───────────────────────────────────────┘   │
│                    │                                             │
│  ┌─────────────────▼───────────────────────────────────────┐   │
│  │  Middleware Layer                                       │   │
│  │  - Authentication (JWT verification)                   │   │
│  │  - Authorization (RBAC)                                │   │
│  │  - Validation (Input validation)                       │   │
│  │  - Error Handling                                      │   │
│  └─────────────────┬───────────────────────────────────────┘   │
│                    │                                             │
│  ┌─────────────────▼───────────────────────────────────────┐   │
│  │  Business Logic Layer                                   │   │
│  │  - Authentication Logic                                │   │
│  │  - User Management                                     │   │
│  │  - Project Management                                  │   │
│  │  - Data Processing                                     │   │
│  └─────────────────┬───────────────────────────────────────┘   │
└─────────────────┬─────────────────────────────────────────────┬─┘
                  │                                               │
                  │ Mongoose ODM                                 │ WhatsApp API
┌─────────────────▼──────────────────┐     ┌───────────────────▼─┐
│     MongoDB Database               │     │   Gupshup API       │
│  ┌──────────────────────────────┐  │     │  (Phase 2+)         │
│  │ Collections:                 │  │     └─────────────────────┘
│  │ - Users                      │  │
│  │ - Projects                   │  │
│  │ - Referrals (Phase 3+)      │  │
│  │ - Payments (Phase 3+)        │  │
│  │ - Escalations (Phase 3+)    │  │
│  │ - AuditLogs (Phase 2+)       │  │
│  └──────────────────────────────┘  │
└───────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow
```
User Input (Email/Password)
    ↓
Frontend Form → API Client (with headers)
    ↓
Backend Route (/api/auth/login)
    ↓
Validation Middleware
    ↓
User Model → Database Query
    ↓
Password Comparison (bcryptjs)
    ↓
JWT Token Generation
    ↓
Response with User + Token
    ↓
Frontend Store (Zustand) → localStorage
    ↓
Redirect to Dashboard
```

### 2. Protected Route Access
```
User Access Route
    ↓
Check localStorage for token
    ↓
No token? → Redirect to /login
    ↓
Yes token? → Include in Authorization header
    ↓
API Request with Bearer token
    ↓
Backend: Extract token from header
    ↓
authenticateToken Middleware
    ↓
Verify JWT signature
    ↓
Invalid/Expired? → Return 401/403
    ↓
Valid? → Attach user to request
    ↓
authorize Middleware (check role permissions)
    ↓
Route Handler executes
    ↓
Response sent to client
```

### 3. API Call Flow
```
Frontend Component
    ↓
useAuthStore() → get token
    ↓
API Client (apiClient.post/get/put/delete)
    ↓
Request Interceptor
    ↓
Add Authorization header with token
    ↓
Send HTTP request
    ↓
Backend Route Handler
    ↓
middleware chain execution
    ↓
Business Logic
    ↓
Database Operation
    ↓
Response formatting (using response.js)
    ↓
Response Interceptor (client-side)
    ↓
Handle 401 → logout + redirect
    ↓
Return data to component
    ↓
Update local/global state
    ↓
Re-render with new data
```

## Component Architecture

### Frontend Components

```
App.jsx
  ├── Router Setup
  ├── Route Configuration
  └── Zustand Provider
      │
      ├── LoginPage
      │   ├── Form Input
      │   ├── useAuthStore (login action)
      │   └── Navigate to Dashboard
      │
      ├── RegisterPage
      │   ├── Form Input (multi-field)
      │   ├── Role Selection
      │   ├── useAuthStore (register action)
      │   └── Navigate to Dashboard
      │
      ├── ProtectedRoute
      │   ├── Check token
      │   ├── Check role permissions
      │   └── Render child or redirect
      │
      └── Layout
          ├── Navigation Bar
          ├── User Info Display
          ├── Logout Button
          └── Content Slot
              │
              └── DashboardPage
                  ├── Profile Card
                  ├── Getting Started Card
                  └── Coming Soon Features
```

### Backend Routes

```
/api/auth
  ├── POST /register
  │   ├── Validation (firstName, lastName, email, phone, password, role)
  │   ├── Check duplicate (email, phone)
  │   ├── Hash password
  │   ├── Create User document
  │   └── Issue JWT token
  │
  ├── POST /login
  │   ├── Validation (email, password)
  │   ├── Find user by email
  │   ├── Verify password
  │   ├── Update lastLogin
  │   └── Issue JWT token
  │
  └── GET /me
      ├── Middleware: authenticateToken
      ├── Get user from database
      ├── Populate projectId reference
      └── Return user details
```

## Database Schema Relationships

```
User
├── _id: ObjectId (primary key)
├── firstName: String
├── lastName: String
├── email: String (unique, indexed)
├── phone: String (unique, indexed)
├── password: String (hashed)
├── role: Enum (indexed)
├── isActive: Boolean
├── projectId: Reference to Project (if applicable)
│   │
│   └── Project
│       ├── _id: ObjectId
│       ├── name: String
│       ├── description: String
│       ├── builder: Reference to User
│       ├── status: String
│       ├── location: String
│       ├── documentation: String
│       └── certifications: Array[Object]
│
├── createdBy: Reference to User (creator)
├── createdAt: Date (index, auto)
└── updatedAt: Date (auto)

Future References (Phase 2+):
├── Referral
│   ├── advocate: Reference to User
│   ├── project: Reference to Project
│   └── ...
│
├── Escalation
│   ├── createdBy: Reference to User
│   ├── project: Reference to Project
│   └── ...
│
└── AuditLog
    ├── user: Reference to User
    ├── action: String
    └── ...
```

## Authentication & Authorization

### JWT Token Structure
```
Header: { alg: "HS256", typ: "JWT" }

Payload: {
  id: "user_id",
  email: "user@example.com",
  role: "builder"
  iat: 1234567890,
  exp: 1241251490
}

Signature: HMACSHA256(encoded_header + "." + encoded_payload, JWT_SECRET)
```

### Role-Based Access Control (RBAC)

```
User Request
    ↓
authenticateToken middleware
    ├── Header has token? 
    ├── Token valid?
    ├── Token not expired?
    └── Attach user to request
    ↓
authorize(...roles) middleware
    ├── User authenticated?
    ├── User role in allowed roles?
    └── Allow access or reject
    ↓
Route Handler / Business Logic
```

## State Management (Frontend)

### Zustand Store (authStore)

```
useAuthStore()
├── State:
│   ├── user: {id, email, firstName, lastName, role, ...}
│   ├── token: "jwt_token_string"
│   ├── isLoading: boolean
│   └── error: string | null
│
└── Actions:
    ├── login(email, password)
    │   ├── Call API
    │   ├── Save token to localStorage
    │   ├── Save user to localStorage
    │   └── Update state
    │
    ├── register(userData)
    │   ├── Call API
    │   ├── Save token to localStorage
    │   ├── Save user to localStorage
    │   └── Update state
    │
    ├── logout()
    │   ├── Remove token from localStorage
    │   ├── Remove user from localStorage
    │   └── Clear state
    │
    ├── setUser(user)
    ├── setError(error)
    └── ...
```

## Error Handling Strategy

### Frontend Error Handling
```
API Call
    ↓
Axios interceptor catches error
    ├── Status 401/403?
    │   ├── Clear token
    │   ├── Clear user
    │   └── Redirect to /login
    │
    ├── Status 400?
    │   ├── Display validation errors
    │   └── Show user-friendly message
    │
    ├── Status 5xx?
    │   ├── Log error
    │   └── Show generic error message
    │
    └── Other?
        └── Show error response
        
Component catches error
    ├── Set error state
    ├── Display error message
    └── Show retry option
```

### Backend Error Handling
```
Route Handler
    ├── Try block
    │   ├── Validate input
    │   ├── Database operation
    │   ├── Send success response
    │   └── Catch validation error → 400
    │
    ├── Catch MongoDB error
    │   ├── Duplicate key → 400
    │   ├── Validation → 400
    │   └── Connection → 500
    │
    ├── Catch other error
    │   └── Send 500 + message
    │
    └── Error middleware
        ├── Format error response
        ├── Log error
        └── Send to client
```

## Scalability Considerations (Future)

### Caching Strategy
```
Redis Cache
├── User sessions (TTL: 7 days)
├── Project data (TTL: 1 hour)
├── Statistics (TTL: 1 hour)
└── Referral data (TTL: 5 minutes)
```

### Database Indexing
```
User Collection
├── email (unique)
├── phone (unique)
├── role (for role-based queries)
├── createdAt (for sorting)
└── projectId (for joining)

Project Collection
├── builder (for filtering)
├── status (for filtering)
└── createdAt (for sorting)
```

### Load Balancing (Future)
```
Load Balancer
├── Server 1 (node-1)
├── Server 2 (node-2)
└── Server 3 (node-3)

Shared Resources:
├── MongoDB (primary + replicas)
├── Redis (cache)
└── File Storage (S3/similar)
```

## Deployment Architecture

### Development
- Single machine with MongoDB
- Frontend: npm run dev
- Backend: npm run dev

### Staging
- Separate frontend server
- Separate backend server
- Shared MongoDB
- Redis cache

### Production
- CDN for frontend (Vercel/Netlify)
- API server cluster (Docker containers)
- MongoDB cluster (with replication)
- Redis cluster
- CloudFront/Cloudflare for caching
- SSL/TLS everywhere
- Monitoring & logging (Sentry, CloudWatch)

## Technology Decisions

### Why Express.js?
- Lightweight and flexible
- Large ecosystem
- Easy middleware integration
- Good performance
- Mature and stable

### Why MongoDB?
- Flexible schema for evolving features
- Easy scaling (horizontal)
- JSON-like documents match JS objects
- Good community support
- Good for referral/lead data structures

### Why React?
- Component-based architecture
- Large ecosystem of libraries
- Virtual DOM for performance
- Good developer experience
- Industry standard

### Why Zustand?
- Lightweight state management
- Simple API
- No boilerplate
- Good for small to medium apps
- Can be extended to Redux if needed

### Why Tailwind CSS?
- Rapid UI development
- Consistent design system
- Small bundle size
- Highly customizable
- Active community

## Security Layers

```
User Input
    ↓
CORS (browser-level)
    ↓
Input Validation (express-validator)
    ↓
Authentication Check (JWT)
    ↓
Authorization Check (RBAC)
    ↓
Database Level (proper permissions)
    ↓
Output Sanitization (remove sensitive data)
    ↓
HTTPS/TLS (in production)
```

## Performance Optimizations

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Minification and compression
- Browser caching
- IndexedDB for offline data

### Backend
- Database indexing
- Connection pooling
- Response compression
- Rate limiting
- Caching strategies

### Database
- Proper indexing
- Query optimization
- Aggregation pipelines
- Connection pooling
