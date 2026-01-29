# User Authentication & Admin Management System

This is a streamlined MERN backend application focused exclusively on user authentication and administrative user management. All product-related functionality has been removed to create a clean, focused user management system.

## System Overview

The application provides:

### 1. Admin Authentication & Authorization
- All admin routes require authentication (`authenticate` middleware)
- Admin role verification (`authorize("admin")` middleware)
- JWT token-based authentication with user ID tracking

### 2. User Management Operations

#### Get All Users (Admin Dashboard)
- **Endpoint**: `GET /api/admin/users`
- **Features**:
  - Pagination support (page, limit)
  - Search functionality (firstName, lastName, email)
  - Filtering by role and status
  - User statistics (total, active, admin counts)
  - Excludes passwords from response

#### Get User Details
- **Endpoint**: `GET /api/admin/users/:id`
- **Features**:
  - Complete user information
  - Account age calculation
  - Last update timestamp
  - Password excluded for security

#### Create New User
- **Endpoint**: `POST /api/admin/users`
- **Features**:
  - Input validation
  - Password hashing
  - Role assignment
  - Email uniqueness check

#### Update User
- **Endpoint**: `PATCH /api/admin/users/:id`
- **Features**:
  - Selective field updates
  - Email uniqueness validation
  - Password hashing if provided
  - Role and status modifications

#### Delete User
- **Endpoint**: `DELETE /api/admin/users/:id`
- **Features**:
  - User existence verification
  - Self-deletion prevention
  - Soft confirmation with user details

### 3. Dashboard Statistics
- **Endpoint**: `GET /api/admin/dashboard/stats`
- **Features**:
  - Total user count
  - Active/inactive user counts
  - Admin/regular user distribution
  - Recent user registrations
  - Monthly user growth data

### 4. Input Validation & Security

#### Validation Rules:
- **Name**: 2-30 characters, trimmed
- **Email**: Valid email format, normalized
- **Password**: Minimum 6 characters with uppercase, lowercase, and number
- **Role**: Only "user" or "admin"
- **Status**: Only "active" or "inactive"

#### Security Features:
- MongoDB ObjectId validation
- JWT token verification
- Password encryption (bcrypt)
- Self-deletion prevention
- Input sanitization

## API Endpoints Summary

### Admin Routes (`/api/admin`)
```
GET    /users              - Get all users with pagination and filtering
GET    /users/:id          - Get specific user details
POST   /users              - Create new user
PATCH  /users/:id          - Update user
DELETE /users/:id          - Delete user
GET    /dashboard/stats    - Get dashboard statistics
```

### User Routes (`/api/users`)
```
POST   /register           - User registration
POST   /login              - User login
GET    /:id/profile        - Get own profile
PATCH  /:id/profile        - Update own profile
```

### Legacy Admin Routes (still available)
```
GET    /                   - Get users (original pagination)
POST   /                   - Create user
GET    /:id                - Get user
PATCH  /:id                - Update user
DELETE /:id                - Delete user
```

## Usage Examples

### 1. Get All Users with Filtering
```javascript
GET /api/admin/users?page=1&limit=10&search=john&role=user&status=active

Response:
{
  "users": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 47,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "totalUsers": 47,
    "activeUsers": 45,
    "adminUsers": 2,
    "regularUsers": 45
  }
}
```

### 2. Update User Role
```javascript
PATCH /api/admin/users/60a7b8c9d8f5a123456789ab
{
  "role": "admin",
  "status": "active"
}

Response:
{
  "message": "User updated successfully",
  "user": {
    "_id": "60a7b8c9d8f5a123456789ab",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "admin",
    "status": "active"
  }
}
```

### 3. Dashboard Statistics
```javascript
GET /api/admin/dashboard/stats

Response:
{
  "totalUsers": 47,
  "activeUsers": 45,
  "adminUsers": 2,
  "regularUsers": 45,
  "recentUsers": [...],
  "userGrowth": [...]
}
```

## Authentication Header
All admin routes require the following header:
```
Authorization: Bearer <jwt_token>
```

## Error Responses

### Common Error Codes:
- `400`: Bad Request (validation errors, invalid data)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (user doesn't exist)
- `500`: Internal Server Error

### Sample Error Response:
```javascript
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## Database Schema
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique, required),
  password: String (required, hashed),
  role: String (default: "user"), // "user" or "admin"
  status: String (default: "active"), // "active" or "inactive"
  createdAt: Date,
  updatedAt: Date
}
```

## Installation Requirements
- express-validator (for input validation)
- bcrypt (for password hashing)
- jsonwebtoken (for authentication)
- mongoose (for database operations)