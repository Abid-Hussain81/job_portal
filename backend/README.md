# Job Portal Backend API

Production-grade REST API for the MERN Job Portal application.

## Tech Stack

- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Folder Structure (MVC Pattern)

```
backend/
├── config/          # Configuration files (DB, JWT)
├── models/          # Mongoose models
├── controllers/     # Business logic
├── routes/          # API routes
├── middleware/      # Custom middleware (auth, error handling)
├── server.js        # Entry point
└── .env             # Environment variables
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and JWT secrets

3. **Start MongoDB:**
   - Make sure MongoDB is running locally or use MongoDB Atlas

4. **Run the server:**
   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production
   ```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user

### Jobs (`/api/jobs`)
- `GET /` - Get all jobs (with filters)
- `GET /:id` - Get single job
- `POST /` - Create job (Employer only)
- `PUT /:id` - Update job (Employer only)
- `DELETE /:id` - Delete job (Employer only)
- `GET /employer/my-jobs` - Get employer's jobs

### Applications (`/api/applications`)
- `POST /` - Apply for job (Candidate only)
- `GET /my-applications` - Get candidate's applications
- `GET /job/:jobId` - Get job applications (Employer only)
- `PUT /:id/status` - Update application status (Employer only)

### Admin (`/api/admin`)
- `GET /dashboard` - Get analytics
- `GET /users` - Get all users
- `PUT /users/:id/approve` - Approve employer
- `PUT /users/:id/toggle-status` - Activate/deactivate user
- `GET /jobs` - Get all jobs
- `PUT /jobs/:id/status` - Update job status

### Profile (`/api/profile`)
- `GET /me` - Get current user's profile
- `PUT /me` - Update profile
- `GET /:userId` - Get user profile (Employer/Admin)

## Key Features

✅ **Role-Based Access Control** - Candidate, Employer, Admin roles
✅ **JWT Authentication** - Secure token-based auth with refresh tokens
✅ **Advanced Filtering** - Location, job type, experience, salary filters
✅ **Pagination** - Efficient data loading
✅ **Input Validation** - Using express-validator
✅ **Error Handling** - Centralized error handling
✅ **Security** - Password hashing, httpOnly cookies
