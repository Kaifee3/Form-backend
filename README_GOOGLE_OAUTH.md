# Google OAuth Integration Setup

## Overview
This backend now supports Google OAuth authentication through the `/api/users/google-login` endpoint.

## What's Been Added

### 1. Dependencies
- `google-auth-library` - For verifying Google ID tokens

### 2. Database Changes
The User model has been updated to support Google OAuth fields:
- `name`: Combined name from Google profile
- `picture`: Google profile picture URL
- `googleId`: Google user ID (unique)
- `password`: Now optional for Google users

### 3. New Endpoint
**POST** `/api/users/google-login`

**Request Body:**
```json
{
  "credential": "google-id-token-here"
}
```

**Response:**
```json
{
  "id": "user-id",
  "firstName": "John",
  "email": "user@example.com",
  "role": "user",
  "token": "jwt-token"
}
```

## Setup Instructions

### 1. Get Google Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials and create a new OAuth 2.0 Client ID
5. Add your domain to authorized origins (e.g., `http://localhost:3000` for development)

### 2. Environment Variables
Update your `.env` file with your Google Client ID:
```env
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
```

### 3. Frontend Integration
Your frontend should:
1. Use Google Sign-In library to get the credential token
2. Send the credential to `/api/users/google-login`
3. Store the returned JWT token for authenticated requests

## How It Works
1. User clicks "Continue with Google" on frontend
2. Google Sign-In library returns a credential token
3. Frontend sends this token to `/api/users/google-login`
4. Backend verifies the token with Google
5. User is found/created in the database
6. JWT token is returned for future authenticated requests

## Security Notes
- Only accepts valid Google ID tokens
- Verifies token audience matches your Client ID
- Users created via Google OAuth have no password (can't use regular login)
- Existing users can link their Google account if they login via Google with the same email