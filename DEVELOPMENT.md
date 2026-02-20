# Development Guide - BuiltCred

This guide provides development best practices and workflows for the BuiltCred project.

## Code Structure & Organization

### Backend Structure
```
server/src/
├── config/           # Configuration files
│   ├── database.js   # MongoDB connection
│   └── constants.js  # Constants, roles, permissions
├── middleware/       # Express middleware
│   ├── auth.js       # JWT authentication
│   └── errorHandler.js
├── models/           # MongoDB models (Mongoose)
│   ├── User.js
│   └── Project.js
├── routes/           # API routes
│   ├── auth.js       # Authentication endpoints
│   └── ...
├── utils/            # Utility functions
│   └── response.js   # Response formatters
└── index.js          # Application entry point
```

### Frontend Structure
```
client/src/
├── api/              # API clients
│   └── client.js     # Axios instance & endpoints
├── components/       # Reusable components
│   ├── Layout.jsx
│   └── ProtectedRoute.jsx
├── pages/            # Page components (routable)
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── DashboardPage.jsx
├── store/            # Zustand stores
│   └── authStore.js
├── App.jsx           # Main app component
└── main.jsx          # App entry point
```

## Naming Conventions

### Backend
- **Files:** camelCase for modules, PascalCase for models
  - `authController.js`, `User.js`, `errorHandler.js`
- **Variables:** camelCase
- **Classes:** PascalCase
- **Routes:** kebab-case with version prefix
  - `/api/v1/auth/login`, `/api/v2/users`

### Frontend
- **Components:** PascalCase (`.jsx`)
  - `LoginPage.jsx`, `UserCard.jsx`
- **Hooks:** Filename matches hook name
  - `useAuth.js` for custom hook
- **Utilities:** camelCase (`.js`)
- **Constants:** UPPER_SNAKE_CASE in separate files

## API Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* detailed errors */ ]
}
```

## Database Schema Guidelines

### User Schema
```javascript
{
  firstName: String (required)
  lastName: String (required)
  email: String (required, unique)
  phone: String (required, unique)
  password: String (required, hashed)
  role: Enum (from USER_ROLES)
  isActive: Boolean (default: true)
  projectId: Reference (if applicable)
  createdBy: Reference (admin who created)
  lastLogin: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## Authentication Flow

1. **Register:** POST `/api/auth/register`
   - Validate input
   - Check if user exists
   - Hash password
   - Create user
   - Issue JWT token

2. **Login:** POST `/api/auth/login`
   - Find user by email
   - Verify password
   - Update lastLogin
   - Issue JWT token

3. **Protected Routes:**
   - Extract token from Authorization header
   - Verify token signature
   - Attach user to request
   - Check permissions if needed

## Development Best Practices

### Backend

1. **Error Handling**
   - Use try-catch blocks
   - Log errors for debugging
   - Return meaningful error messages
   - Use appropriate HTTP status codes

2. **Validation**
   - Use express-validator for route validation
   - Validate input types and formats
   - Check business logic constraints

3. **Security**
   - Never commit sensitive data (.env)
   - Hash passwords before storage
   - Validate tokens on protected routes
   - Sanitize user inputs
   - Use CORS carefully

4. **Database**
   - Create indexes for frequently queried fields
   - Use proper TypeScript interfaces
   - Set up data relationships correctly
   - Handle cascade deletions

5. **Code Quality**
   - Keep functions small and focused
   - Use meaningful variable names
   - Add comments for complex logic
   - Follow DRY principle

### Frontend

1. **State Management**
   - Use Zustand for global state
   - Local state for component-specific data
   - Avoid prop drilling
   - Clear separation of concerns

2. **Component Design**
   - Single Responsibility Principle
   - Reusable and composable
   - Props documentation
   - Proper prop validation

3. **Performance**
   - Lazy load routes
   - Memoize expensive computations
   - Optimize images
   - Minimize bundle size

4. **Testing**
   - Test critical paths
   - Mock API calls
   - Test user interactions
   - Component snapshot tests

5. **Styling**
   - Use Tailwind CSS utilities
   - Create reusable component classes
   - Maintain consistent spacing
   - Responsive design first

## Git Workflow

1. **Commit Messages**
   ```
   [Feature|Fix|Docs|Style|Refactor] - Brief description
   
   Detailed explanation if needed
   ```

2. **Branch Naming**
   ```
   feature/new-feature-name
   fix/bug-description
   docs/documentation-topic
   ```

3. **Pull Request Guidelines**
   - Describe changes
   - Link related issues
   - Request review
   - Ensure CI passes

## Testing Guidelines

### Backend Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm test -- --coverage
```

### Frontend Tests
```bash
# Run components tests
npm test

# Run with coverage
npm test -- --coverage
```

## Deployment

### Environment Variables

#### Production vs Development
```env
# Development
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/builtcred
JWT_SECRET=dev_secret

# Production
NODE_ENV=production
MONGODB_URI=mongodb://prod.server.com/builtcred
JWT_SECRET=strong_production_secret
```

### Build & Deploy Process

1. **Backend**
   ```bash
   npm install --production
   npm start
   ```

2. **Frontend**
   ```bash
   npm run build
   # Serve dist/ folder using nginx/vercel/etc
   ```

## Adding a New Feature

### Backend Steps
1. Create model if needed in `models/`
2. Create controller/route in `routes/`
3. Add validation middleware
4. Add authentication middleware if needed
5. Update constants if adding new roles/permissions
6. Write tests
7. Update API documentation

### Frontend Steps
1. Create page/component in `pages/` or `components/`
2. Add API calls in `api/client.js`
3. Update Zustand store if needed
4. Add routing
5. Add error handling
6. Write component tests
7. Update documentation

## Common Commands

### Backend
```bash
cd server
npm run dev          # Start development server
npm start            # Start production
npm test             # Run tests
npm run lint         # Lint code
```

### Frontend
```bash
cd client
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview build
npm run lint         # Lint code
```

## Debugging

### Backend
- Enable debug logs: `DEBUG=* npm run dev`
- Use MongoDB Compass for database inspection
- Check server logs for errors

### Frontend
- React DevTools extension
- Network tab in browser DevTools
- Check console for errors
- Use debugger statements

## Performance Optimization

### Backend
- Setup caching (Redis)
- Create database indexes
- Batch operations when possible
- Compress responses

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Remove unused dependencies
- Production builds

## Documentation

- Keep README.md minimal with links
- Create detailed docs in `/docs` folder
- Comment complex logic
- Update docs with feature changes
- Include code examples

## Resources

- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
