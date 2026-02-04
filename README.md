# 🏠 NestroStay MVP - Student Housing Platform

A comprehensive MVP platform for finding and managing student housing (mess/hostels) in Dhaka, Bangladesh.

## � Quick Start

```bash
# Windows
start.bat

# Unix/Mac
bash start.sh
```

**Then visit**: http://localhost:3000 (frontend) and http://localhost:5000 (backend)

**Test Credentials**:
- Student: karim@example.com / student123456
- Owner: ahmed@example.com / owner123456
- Admin: admin@example.com / admin123456

**📚 Documentation**: See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for complete guide

---

## �📋 Project Overview

**NestroStay** connects college/university students with property owners offering mess and hostel accommodations. The platform includes role-based access for:
- **Students**: Search, book, and review listings
- **Owners**: Manage listings and bookings
- **Admin**: Verify users/listings and moderate content

## ⚡ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **State Management**: Context API

## 📁 Project Structure

```
stu_housing_mpv/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth & validation
│   │   ├── utils/           # Helpers & DB
│   │   ├── seeds/           # Seed data scripts
│   │   └── index.js         # Express app entry
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── context/         # Context providers
│   │   ├── App.js           # Main app
│   │   └── index.js         # React entry
│   ├── public/
│   ├── package.json
│   └── .env.example
│
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14+)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
# MONGODB_URI=mongodb://localhost:27017/stu_housing
# JWT_SECRET=your_secret_key_here

# Seed demo data (optional but recommended)
npm run seed

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start React development server
npm start

# App runs on http://localhost:3000
```

## 📊 Database Schema

### Users Collection
- `_id`, `name`, `email` (unique), `mobile`
- `passwordHash`, `role` (student|owner|admin)
- `isVerified`, `nidImage`, `profileImage`
- `createdAt`, `updatedAt`

### Listings Collection
- `_id`, `ownerId`, `title`, `address`, `city`
- `location` (lat, lng), `type` (mess|hostel)
- `rent`, `deposit`, `genderAllowed`
- `meals`, `facilities`, `photos`, `rules`
- `verified`, `badges`, `averageRating`, `totalRatings`

### Bookings Collection
- `_id`, `listingId`, `studentId`
- `status` (pending|accepted|rejected|completed)
- `moveInDate`, `notes`

### Reviews Collection
- `_id`, `bookingId`, `listingId`, `studentId`, `ownerId`
- `ratings` (food, cleanliness, safety, owner, facilities, study: 1-5)
- `textReview`, `ownerReply`, `repliedAt`

### Flags Collection
- `_id`, `listingId`, `flaggedBy`
- `reason`, `resolved`, `adminNotes`

## 🔑 API Endpoints

### Authentication
```
POST   /api/v1/auth/register    # Register new user
POST   /api/v1/auth/login       # Login
GET    /api/v1/auth/me          # Get current user
```

### Listings
```
GET    /api/v1/listings                     # Get all listings (with filters)
GET    /api/v1/listings/:id                 # Get listing details
POST   /api/v1/listings                     # Create listing (owner only)
PUT    /api/v1/listings/:id                 # Update listing (owner only)
GET    /api/v1/listings/owner/my-listings   # Get owner's listings
```

### Bookings
```
POST   /api/v1/bookings                # Create booking request (student)
GET    /api/v1/bookings/owner          # Get owner's booking requests
GET    /api/v1/bookings/student        # Get student's bookings
PUT    /api/v1/bookings/:id/status     # Update booking status (owner)
```

### Reviews
```
POST   /api/v1/reviews                        # Create review (student)
GET    /api/v1/reviews/listing/:listingId    # Get listing reviews
PUT    /api/v1/reviews/:id/reply             # Reply to review (owner)
```

### Flags
```
POST   /api/v1/flags    # Flag a listing (student only)
```

### Admin
```
GET    /api/v1/admin/dashboard/stats         # Dashboard statistics
GET    /api/v1/admin/owners/unverified       # Get unverified owners
PUT    /api/v1/admin/owners/:userId/verify   # Verify owner
GET    /api/v1/admin/listings/unverified     # Get unverified listings
PUT    /api/v1/admin/listings/:id/verify     # Verify listing
GET    /api/v1/admin/flags                   # Get all flags
PUT    /api/v1/admin/flags/:id/resolve       # Resolve flag
```

## 👥 Demo Accounts

Use these credentials after running the seed script:

| Role  | Email                | Password       |
|-------|----------------------|----------------|
| Admin | admin@example.com    | admin123456    |
| Owner | ahmed@example.com    | owner123456    |
| Owner | fatima@example.com   | owner123456    |
| Student | karim@example.com  | student123456  |
| Student | nadia@example.com  | student123456  |

## 🎯 Features Implemented

### ✅ Student Module
- [x] Search listings by city, budget, gender, type
- [x] View listing details with photos and ratings
- [x] Submit booking requests
- [x] View my bookings with status
- [x] Post reviews (after completed booking)
- [x] Flag inappropriate listings

### ✅ Owner Module
- [x] Create and manage listings
- [x] View booking requests
- [x] Accept/reject bookings
- [x] View and reply to reviews (once per review)
- [x] Dashboard with stats

### ✅ Admin Module
- [x] Verify owners and listings
- [x] View dashboard statistics
- [x] Manage flags and moderate content
- [x] Review resolution logs

### ✅ Technical Features
- [x] Role-based access control (RBAC)
- [x] JWT authentication
- [x] Password hashing with bcrypt
- [x] Input validation
- [x] Error handling
- [x] Seed data for testing
- [x] Mobile-first UI
- [x] Responsive design

## 🔐 Security Features

- JWT-based authentication
- Password hashing using bcryptjs
- Role-based authorization middleware
- Input validation on all endpoints
- CORS enabled
- Secure error messages

## 📱 Frontend Pages

- **Home**: Browse and filter listings
- **Login/Register**: User authentication
- **Listing Details**: Full listing info, reviews, booking
- **Student Dashboard**: My bookings and reviews
- **Owner Dashboard**: Listings, bookings, reviews
- **Admin Dashboard**: Stats, verification, flags

## 🧪 Testing

### Manual Testing
1. Register as different roles (student, owner)
2. Login with demo credentials
3. Create listings (owner)
4. Browse and book listings (student)
5. Submit and reply to reviews
6. Flag listings
7. Verify content as admin

### Test the API
```bash
# Using curl or Postman

# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","mobile":"01700000000","password":"pass123","role":"student"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Get listings
curl http://localhost:5000/api/v1/listings?city=Dhaka
```

## 🚢 Deployment

### Backend (Heroku/Railway)
```bash
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy the 'build' folder
```

## 🔧 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/stu_housing
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123456
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api/v1
```

## 📦 Dependencies

### Backend
- express (web framework)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- cors (cross-origin requests)
- express-validator (input validation)
- dotenv (environment variables)

### Frontend
- react, react-dom
- react-router-dom (routing)
- axios (HTTP client)
- tailwindcss (styling)

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or Atlas credentials are correct
- Check `MONGODB_URI` in `.env`

### Port Already in Use
```bash
# Backend (change port in .env)
PORT=5001

# Frontend (change port with environment variable)
PORT=3001 npm start
```

### CORS Errors
- Ensure backend `CORS` is enabled
- Verify `REACT_APP_API_URL` matches backend URL

### Token Expired
- Clear localStorage and login again
- Increase `JWT_EXPIRE` in backend `.env`

## 📝 Future Enhancements

- [ ] Image upload to cloud (AWS S3 or Cloudinary)
- [ ] Distance-based search (geolocation)
- [ ] Advanced filtering (amenities, food type)
- [ ] Payment integration (bKash, Nagad)
- [ ] Messaging system (student-owner)
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Recommendation engine

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created as a Student Housing MVP platform for Dhaka, Bangladesh.

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Happy Housing! 🏠**
