# Wishlist API Documentation

This document describes the wishlist functionality endpoints for the MERN Cafe backend.

## Overview

The wishlist feature allows authenticated users to:
- Add items (reviews) to their personal wishlist
- Remove items from their wishlist
- Toggle items in/out of their wishlist
- View their complete wishlist with populated item details

## Authentication

All wishlist endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get User's Wishlist
- **URL:** `GET /api/users/wishlist`
- **Auth:** Required
- **Description:** Retrieve the authenticated user's complete wishlist with populated review details

**Response:**
```json
{
  "message": "Wishlist retrieved successfully",
  "wishlist": [
    {
      "_id": "review_id_here",
      "userName": "John Doe",
      "difficulty": "moderate",
      "comment": "Great content, very helpful!",
      "rating": 4,
      "status": "approved",
      "createdAt": "2026-02-09T10:30:00.000Z"
    }
  ]
}
```

### 2. Add Item to Wishlist
- **URL:** `POST /api/users/wishlist/add`
- **Auth:** Required
- **Description:** Add a review/item to the user's wishlist

**Request Body:**
```json
{
  "itemId": "65f1234567890abcdef12345"
}
```

**Response:**
```json
{
  "message": "Item added to wishlist successfully",
  "wishlist": ["65f1234567890abcdef12345", ...]
}
```

### 3. Remove Item from Wishlist
- **URL:** `POST /api/users/wishlist/remove`
- **Auth:** Required
- **Description:** Remove a specific item from the user's wishlist

**Request Body:**
```json
{
  "itemId": "65f1234567890abcdef12345"
}
```

**Response:**
```json
{
  "message": "Item removed from wishlist successfully",
  "wishlist": [...]
}
```

### 4. Toggle Item in Wishlist
- **URL:** `POST /api/users/wishlist/toggle`
- **Auth:** Required
- **Description:** Smart toggle - adds item if not in wishlist, removes if already present

**Request Body:**
```json
{
  "itemId": "65f1234567890abcdef12345"
}
```

**Response:**
```json
{
  "message": "Item added to wishlist successfully",
  "action": "added",
  "isInWishlist": true,
  "wishlist": ["65f1234567890abcdef12345", ...]
}
```

## Error Responses

### Validation Errors
```json
{
  "message": "Validation errors",
  "errors": [
    {
      "msg": "Item ID must be a valid MongoDB ObjectId",
      "param": "itemId"
    }
  ]
}
```

### Business Logic Errors
```json
{
  "message": "Item is already in wishlist"
}
```

```json
{
  "message": "Item is not in wishlist"
}
```

### Auth Errors
```json
{
  "message": "Access denied. No token provided"
}
```

## Frontend Integration Examples

### React.js Component Example
```jsx
const WishlistButton = ({ reviewId, isInWishlist, onToggle }) => {
  const [loading, setLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(isInWishlist);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ itemId: reviewId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setInWishlist(data.isInWishlist);
        onToggle && onToggle(data);
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle} 
      disabled={loading}
      className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
    >
      {loading ? '...' : inWishlist ? '❤️ Remove' : '🤍 Add to Wishlist'}
    </button>
  );
};
```

### Wishlist Page Component
```jsx
const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/users/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setWishlist(data.wishlist);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      const response = await fetch('/api/users/wishlist/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ itemId })
      });
      
      if (response.ok) {
        setWishlist(prev => prev.filter(item => item._id !== itemId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  return (
    <div className="wishlist-page">
      <h2>My Wishlist</h2>
      {loading ? (
        <p>Loading...</p>
      ) : wishlist.length > 0 ? (
        <div className="wishlist-grid">
          {wishlist.map(item => (
            <div key={item._id} className="wishlist-item">
              <h3>{item.userName}</h3>
              <p>Difficulty: {item.difficulty}</p>
              <p>Rating: {item.rating}/5</p>
              <p>{item.comment}</p>
              <button 
                onClick={() => removeFromWishlist(item._id)}
                className="remove-btn"
              >
                Remove from Wishlist
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Your wishlist is empty</p>
      )}
    </div>
  );
};
```

## Database Schema

The wishlist is stored as an array of ObjectIds in the User model:

```javascript
wishlist: [{ 
  type: mongoose.Schema.Types.ObjectId, 
  ref: "Review" 
}]
```

This allows for efficient queries and automatic population of review details when needed.