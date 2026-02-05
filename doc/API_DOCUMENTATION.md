# GenNotes API Documentation

Base URL (Production): `https://api.gennotes.vercel.app`
Base URL (Development): `http://localhost:3000`

All API routes are prefixed with `/api/v1`

---

## Authentication Endpoints

### 1. Sign Up
**Endpoint:** `POST /api/v1/auth/sign-up`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully. Please check your email for verification code.",
  "data": {
    "email": "john@example.com",
    "requiresVerification": true
  }
}
```

**Error Responses:**
- `400`: Invalid input (missing fields, weak password, invalid email)
- `409`: User already exists

---

### 2. Sign In
**Endpoint:** `POST /api/v1/auth/sign-in`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User signed in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "isVerified": true,
      "createdAt": "2025-11-18T10:30:00Z",
      "updatedAt": "2025-11-18T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `400`: Missing credentials
- `401`: Invalid credentials
- `403`: Email not verified

---

### 3. Verify OTP
**Endpoint:** `POST /api/v1/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "isVerified": true,
      "createdAt": "2025-11-18T10:30:00Z",
      "updatedAt": "2025-11-18T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `400`: Invalid or expired OTP

---

### 4. Resend OTP
**Endpoint:** `POST /api/v1/auth/resend-otp`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

**Error Responses:**
- `400`: Email already verified
- `404`: User not found
- `500`: Failed to send email

---

### 5. Forgot Password
**Endpoint:** `POST /api/v1/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

---

### 6. Reset Password
**Endpoint:** `POST /api/v1/auth/reset-password/:token`

**URL Parameters:**
- `token`: Reset token from email link

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**
- `400`: Invalid/expired token, weak password, same as old password

---

### 7. Sign Out
**Endpoint:** `POST /api/v1/auth/sign-out`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

---

## Notes Endpoints

**Authentication Required:** All notes endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### 1. Get All Notes
**Endpoint:** `GET /api/v1/notes`

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My First Note",
    "content": "<p>Note content in HTML</p>",
    "user": "507f1f77bcf86cd799439012",
    "createdAt": "2025-11-18T10:30:00Z",
    "updatedAt": "2025-11-18T10:30:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Second Note",
    "content": "<h1>Title</h1><p>Content</p>",
    "user": "507f1f77bcf86cd799439012",
    "createdAt": "2025-11-18T11:30:00Z",
    "updatedAt": "2025-11-18T11:30:00Z"
  }
]
```

**Error Responses:**
- `401`: Unauthorized (missing/invalid token)
- `500`: Server error

---

### 2. Get Note by ID
**Endpoint:** `GET /api/v1/notes/:id`

**URL Parameters:**
- `id`: Note ID

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "My First Note",
  "content": "<p>Note content in HTML</p>",
  "user": "507f1f77bcf86cd799439012",
  "createdAt": "2025-11-18T10:30:00Z",
  "updatedAt": "2025-11-18T10:30:00Z"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Note not found
- `500`: Server error

---

### 3. Create Note
**Endpoint:** `POST /api/v1/notes`

**Request Body:**
```json
{
  "title": "My First Note",
  "content": "<p>Note content in HTML</p>"
}
```

**Success Response (201):**
```json
{
  "message": "Note created successfully."
}
```

**Error Responses:**
- `400`: Missing title or content
- `401`: Unauthorized
- `500`: Server error

---

### 4. Update Note
**Endpoint:** `PUT /api/v1/notes/:id`

**URL Parameters:**
- `id`: Note ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content</p>"
}
```

**Success Response (200):**
```json
{
  "message": "Note updated successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Note not found
- `500`: Server error

---

### 5. Delete Note
**Endpoint:** `DELETE /api/v1/notes/:id`

**URL Parameters:**
- `id`: Note ID

**Success Response (200):**
```json
{
  "message": "Note deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Note not found
- `500`: Server error

---

## User Endpoints

### 1. Get All Users
**Endpoint:** `GET /api/v1/users`

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true,
    "createdAt": "2025-11-18T10:30:00Z",
    "updatedAt": "2025-11-18T10:30:00Z"
  }
]
```

---

### 2. Get User by ID
**Endpoint:** `GET /api/v1/users/:id`

**Authentication Required:** Yes (Bearer token)

**URL Parameters:**
- `id`: User ID

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "John Doe",
  "email": "john@example.com",
  "isVerified": true,
  "createdAt": "2025-11-18T10:30:00Z",
  "updatedAt": "2025-11-18T10:30:00Z"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: User not found

---

## Rate Limiting

All endpoints are subject to rate limiting:

- **General Limit:** 60 requests per 15 minutes per IP
- **Auth Limit:** 15 requests per 15 minutes per IP (stricter for security)

**Rate Limited Response (429):**
```json
{
  "status": 429,
  "message": "Too many requests from this IP. Please try again after 15 minutes."
}
```

---

## Error Handling

### Standard Error Response:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes:
- `200`: OK - Request successful
- `201`: Created - Resource created successfully
- `400`: Bad Request - Invalid input or validation error
- `401`: Unauthorized - Missing/invalid authentication token
- `403`: Forbidden - User action not allowed
- `404`: Not Found - Resource doesn't exist
- `409`: Conflict - Resource already exists (duplicate email)
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Unexpected server error

---

## Authentication Flow

### Using the Token

1. **Login/Signup/Verify OTP** → Receive `token`
2. **Store token** in `localStorage`
3. **Add to every request:**
   ```javascript
   Authorization: Bearer <token>
   ```

### Frontend Example (Axios):
```javascript
const token = localStorage.getItem("token");
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

### Token Expiration:
- Tokens expire based on `JWT_EXPIRE_IN` (default: 7 days)
- After expiration, user must login again
- Expired tokens will return 401 Unauthorized

---

## Development vs Production

### Development:
- Base URL: `http://localhost:3000`
- API URL: `http://localhost:3000/api/v1/`

### Production:
- Base URL: `https://api.gennotes.vercel.app`
- API URL: `https://api.gennotes.vercel.app/api/v1/`

---

## Testing with cURL

```bash
# Sign Up
curl -X POST http://localhost:3000/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Sign In
curl -X POST http://localhost:3000/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Get Notes (with token)
curl -X GET http://localhost:3000/api/v1/notes \
  -H "Authorization: Bearer <token>"

# Create Note
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"<p>Content</p>"}'
```

---

Document Version: 1.0
Last Updated: November 18, 2025
