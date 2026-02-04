# 🏗️ Architecture & API Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ HomePage     │  │ Dashboards   │  │ Auth Pages   │     │
│  │ (Listings)   │  │ (S/O/A)      │  │ (L/R)        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↓                  ↓                  ↓              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │        API Client (Axios) + Auth Context           │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP
                               ↓
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND (Express.js)                       │
│                                                              │
│  Routes Layer                                               │
│  /auth  →  /listings  →  /bookings  →  /reviews            │
│   ↓          ↓            ↓              ↓                  │
│  ┌──────────────────────────────────────────────────┐     │
│  │            Controllers (Business Logic)         │     │
│  │ auth  →  listing  →  booking  →  review  →  flag│     │
│  └──────────────────────────────────────────────────┘     │
│                    ↓                                         │
│  ┌──────────────────────────────────────────────────┐     │
│  │      Middleware (Auth, Validation, Errors)      │     │
│  └──────────────────────────────────────────────────┘     │
│                    ↓                                         │
│  ┌──────────────────────────────────────────────────┐     │
│  │          Models (Mongoose Schemas)              │     │
│  │ User  Listing  Booking  Review  Flag            │     │
│  └──────────────────────────────────────────────────┘     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ↓
                      ┌──────────────────┐
                      │  MongoDB Atlas   │
                      │   (Database)     │
                      └──────────────────┘
```

## API Route Structure

### Authentication Routes (`/api/v1/auth`)

```javascript
POST   /register
├── Input: { name, email, mobile, password, role }
├── Output: { token, user }
└── Role: PUBLIC

POST   /login
├── Input: { email, password }
├── Output: { token, user }
└── Role: PUBLIC

GET    /me
├── Output: { user }
└── Role: AUTHENTICATED
```

### Listing Routes (`/api/v1/listings`)

```javascript
GET    /
├── Query: { city, genderAllowed, type, minRent, maxRent, page, limit }
├── Output: { listings, pagination }
└── Role: PUBLIC

GET    /:id
├── Output: { listing, reviews }
└── Role: PUBLIC

POST   /
├── Input: { title, address, city, type, rent, deposit, ... }
├── Output: { listing }
└── Role: OWNER

PUT    /:id
├── Input: { ...listingUpdates }
├── Output: { listing }
└── Role: OWNER (own listing only)

GET    /owner/my-listings
├── Output: { listings }
└── Role: OWNER
```

### Booking Routes (`/api/v1/bookings`)

```javascript
POST   /
├── Input: { listingId, moveInDate, notes }
├── Output: { booking }
└── Role: STUDENT

GET    /owner
├── Output: { bookings[] }
└── Role: OWNER

GET    /student
├── Output: { bookings[] }
└── Role: STUDENT

PUT    /:id/status
├── Input: { status: 'accepted|rejected' }
├── Output: { booking }
└── Role: OWNER
```

### Review Routes (`/api/v1/reviews`)

```javascript
POST   /
├── Input: { bookingId, ratings: {...}, textReview }
├── Output: { review }
└── Role: STUDENT (completed booking only)

GET    /listing/:listingId
├── Output: { reviews[] }
└── Role: PUBLIC

PUT    /:id/reply
├── Input: { reply: "text" }
├── Output: { review }
└── Role: OWNER (own listing only, once per review)
```

### Flag Routes (`/api/v1/flags`)

```javascript
POST   /
├── Input: { listingId, reason }
├── Output: { flag }
└── Role: STUDENT
```

### Admin Routes (`/api/v1/admin`)

```javascript
GET    /dashboard/stats
├── Output: { stats: { users, listings, bookings, reviews, flags } }
└── Role: ADMIN

GET    /owners/unverified
├── Output: { owners[] }
└── Role: ADMIN

PUT    /owners/:userId/verify
├── Output: { user }
└── Role: ADMIN

GET    /listings/unverified
├── Output: { listings[] }
└── Role: ADMIN

PUT    /listings/:id/verify
├── Output: { listing }
└── Role: ADMIN

GET    /flags
├── Output: { flags[] }
└── Role: ADMIN

PUT    /flags/:id/resolve
├── Input: { adminNotes }
├── Output: { flag }
└── Role: ADMIN
```

## Data Flow Examples

### 1. Student Browsing Listings

```
┌──────────────┐
│  Homepage    │
└──────┬───────┘
       │ Component Mount
       ↓
┌──────────────────────────────────┐
│ listingService.getListings({})   │
└──────────────┬───────────────────┘
               │ API Call
               ↓
┌──────────────────────────────────┐
│ GET /api/v1/listings             │
│ ↓                                │
│ Route Handler (public)           │
│ ↓                                │
│ List all verified listings       │
│ ↓                                │
│ Return: { listings[], pagination}
└──────────────┬───────────────────┘
               │ Response
               ↓
┌──────────────────────────────────┐
│ setListings(response.data)       │
│ Re-render with listings          │
└──────────────────────────────────┘
```

### 2. Student Booking a Listing

```
┌──────────────────────────┐
│ ListingDetailPage        │
│ "Request Booking" Click  │
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────────────┐
│ BookingModal Component           │
│ User fills moveInDate + notes    │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│ bookingService.createBooking()   │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│ POST /api/v1/bookings            │
│ ↓                                │
│ @auth (student only)             │
│ ↓                                │
│ Create Booking record            │
│ status = "pending"               │
│ ↓                                │
│ Return: { booking }              │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│ Show success message             │
│ "Booking request submitted!"     │
└──────────────────────────────────┘
```

### 3. Owner Accepting Booking

```
┌──────────────────────────┐
│ OwnerDashboard           │
│ Bookings Tab             │
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────────────┐
│ Display pending bookings         │
│ "Accept" Button clicked          │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│ bookingService.updateStatus()    │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│ PUT /api/v1/bookings/:id/status  │
│ ↓                                │
│ @auth (owner only)               │
│ ↓                                │
│ Check listing ownership          │
│ ↓                                │
│ Update booking status = accepted │
│ ↓                                │
│ Return: { booking }              │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│ Refresh bookings list            │
│ Show updated status              │
└──────────────────────────────────┘
```

## State Management Flow

```
┌────────────────────────────────────┐
│      AuthContext (Global State)    │
├────────────────────────────────────┤
│ - user: { id, name, email, role }  │
│ - token: JWT string                │
│ - isAuthenticated: boolean         │
│                                    │
│ Methods:                           │
│ - login(email, password)           │
│ - register(...)                    │
│ - logout()                         │
└────────────────────────────────────┘
```

## Authentication Flow (JWT)

```
1. User registers/logs in
   └→ Backend generates JWT token
      └→ Token contains: { userId, role, expiresIn }

2. Frontend stores token in localStorage
   └→ Token sent in Authorization header with every request

3. Backend middleware verifies token
   └→ If valid: attach user info to req.user
   └→ If invalid: return 401 Unauthorized

4. Logout clears localStorage
   └→ No token → requests unauthorized
   └→ Redirect to login
```

## Error Handling

```
├─ 400 Bad Request
│  └─ Missing fields, invalid format
│
├─ 401 Unauthorized
│  └─ No token, invalid token
│
├─ 403 Forbidden
│  └─ Insufficient permissions for role
│
├─ 404 Not Found
│  └─ Resource doesn't exist
│
└─ 500 Server Error
   └─ Unexpected error
```

## Role Permissions Matrix

| Action | Student | Owner | Admin |
|--------|---------|-------|-------|
| View listings | ✅ | ✅ | ✅ |
| Create listing | ❌ | ✅ | ✅ |
| Book listing | ✅ | ❌ | ❌ |
| Accept booking | ❌ | ✅ | ✅ |
| Write review | ✅ | ❌ | ❌ |
| Reply to review | ❌ | ✅ | ✅ |
| Flag listing | ✅ | ❌ | ❌ |
| Verify user | ❌ | ❌ | ✅ |
| Verify listing | ❌ | ❌ | ✅ |
| Resolve flags | ❌ | ❌ | ✅ |

---

**Architecture complete! All components are modular, scalable, and secure.** 🚀
