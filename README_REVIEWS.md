# Reviews API Documentation

## Overview
The Reviews API allows users to submit feedback about their cafe experience with difficulty ratings and comments. Admins can manage and moderate all reviews.

## Features
- User can submit reviews with difficulty level (easy/moderate/hard), rating (1-5), and comments
- Users can view, update, or delete their own reviews
- Public can view approved reviews only
- Admin can view all reviews (pending/approved/rejected)
- Admin can approve/reject reviews
- Statistics and analytics for reviews

## API Endpoints

### Public Endpoints
#### Get Public Reviews (Approved Only)
```
GET /api/reviews/public
Query Parameters:
- difficulty: easy|moderate|hard (optional)
- page: number (default: 1)
- limit: number (default: 10)
```

### User Endpoints (Requires Authentication)
#### Create Review
```
POST /api/reviews/
Headers: Authorization: Bearer <token>
Body: {
  "difficulty": "easy|moderate|hard",
  "comment": "Your review comment (10-1000 chars)",
  "rating": 1-5
}
```

#### Get My Reviews
```
GET /api/reviews/my-reviews
Headers: Authorization: Bearer <token>
```

#### Update My Review
```
PUT /api/reviews/my-review
Headers: Authorization: Bearer <token>
Body: {
  "difficulty": "easy|moderate|hard",
  "comment": "Updated comment",
  "rating": 1-5
}
```

#### Delete My Review
```
DELETE /api/reviews/my-review
Headers: Authorization: Bearer <token>
```

### Admin Endpoints (Requires Authentication + Admin Role)
#### Get Dashboard Stats
```
GET /api/reviews/admin/dashboard/stats
Headers: Authorization: Bearer <token>
```

#### Get All Reviews (Admin)
```
GET /api/reviews/admin
Headers: Authorization: Bearer <token>
Query Parameters:
- status: pending|approved|rejected (optional)
- difficulty: easy|moderate|hard (optional)
- page: number (default: 1)
- limit: number (default: 10)
```

#### Get Review Details
```
GET /api/reviews/admin/:id
Headers: Authorization: Bearer <token>
```

#### Update Review Status
```
PATCH /api/reviews/admin/:id/status
Headers: Authorization: Bearer <token>
Body: {
  "status": "pending|approved|rejected",
  "adminNote": "Optional admin note"
}
```

#### Delete Review (Admin)
```
DELETE /api/reviews/admin/:id
Headers: Authorization: Bearer <token>
```

## Review Model Schema
```javascript
{
  user: ObjectId (ref: User),
  userName: String,
  difficulty: "easy"|"moderate"|"hard",
  comment: String (10-1000 chars),
  rating: Number (1-5),
  status: "pending"|"approved"|"rejected" (default: "pending"),
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Examples

### Submit a Review (User)
```javascript
// POST /api/reviews/
{
  "difficulty": "moderate",
  "comment": "The cafe has a nice ambiance and good coffee. Service was decent but could be faster during peak hours.",
  "rating": 4
}
```

### Approve a Review (Admin)
```javascript
// PATCH /api/reviews/admin/507f1f77bcf86cd799439011/status
{
  "status": "approved",
  "adminNote": "Great feedback, approved for public viewing"
}
```

## Validation Rules
- **Difficulty**: Must be one of: "easy", "moderate", "hard"
- **Comment**: Required, 10-1000 characters
- **Rating**: Required, integer between 1-5
- **Status**: Must be one of: "pending", "approved", "rejected" (Admin only)

## Response Status Codes
- **201**: Review created successfully
- **200**: Request successful
- **400**: Bad request/Validation error
- **401**: Unauthorized
- **403**: Forbidden (Admin required)
- **404**: Review not found
- **409**: Conflict (User already has a review)

## Example Frontend Integration

### Submit Review Form
```javascript
const submitReview = async (reviewData, token) => {
  const response = await fetch('/api/reviews/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  return response.json();
};
```

### Admin Review Management
```javascript
const approveReview = async (reviewId, adminNote, token) => {
  const response = await fetch(`/api/reviews/admin/${reviewId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: 'approved',
      adminNote: adminNote
    })
  });
  return response.json();
};
```

## Security Features
- JWT authentication required for user actions
- Admin role verification for admin endpoints
- Input validation and sanitization
- Rate limiting recommended (implement if needed)
- Review ownership verification for updates/deletes