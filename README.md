# MERN Job Portal + Admin CMS

A production-grade job portal system built with the MERN stack featuring role-based access control for Candidates, Employers, and Admins.

## 🎯 Project Overview

This is an **intermediate to advanced** MERN stack project that demonstrates:
- Complex CRUD operations
- Role-based authentication & authorization
- Advanced filtering and search
- RESTful API design
- Modern React patterns with Next.js App Router
- Production-ready code structure

## 🏗️ Architecture

### Backend (`/backend`)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with httpOnly cookies
- **Pattern**: MVC (Model-View-Controller)
- **Security**: bcrypt password hashing, CORS, input validation

### Frontend (`/frontend`)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context API
- **HTTP**: Axios with interceptors

## ✨ Features

### 🎓 For Candidates
- Browse jobs with advanced filters (location, type, experience, salary)
- Search functionality
- View detailed job descriptions
- Apply with cover letter and resume
- Track application status

### 💼 For Employers
- Dashboard with statistics
- Post comprehensive job listings
- View and manage applicants
- Shortlist, accept, or reject candidates
- Track application metrics

### 👨‍💼 For Admins
- System analytics dashboard
- User management
- Employer approval workflow
- Job moderation
- Platform statistics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   cd "e:\learning next js\Job Portal"
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Configure .env file (see backend/.env.example)
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   # Configure .env.local (see frontend/.env.local)
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 Learning Highlights

### Backend Concepts
- **MVC Pattern**: Clean separation of concerns
- **Middleware**: Authentication, authorization, error handling
- **Mongoose**: Schema design, relationships, indexes
- **JWT**: Token generation, refresh mechanism
- **Validation**: express-validator for input sanitization

### Frontend Concepts
- **App Router**: Next.js 15 file-based routing
- **TypeScript**: Type-safe development
- **Context API**: Global state management
- **Protected Routes**: HOC pattern for authorization
- **API Integration**: Axios interceptors for token refresh

## 🗂️ Project Structure

```
Job Portal/
├── backend/
│   ├── config/          # DB and JWT configuration
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, validation, errors
│   └── server.js        # Entry point
├── frontend/
│   ├── app/            # Next.js pages
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   ├── lib/            # Utilities
│   └── public/         # Static assets
└── README.md           # This file
```

## 🔐 Authentication Flow

1. User registers with role (candidate/employer)
2. Backend hashes password and creates user
3. JWT tokens (access + refresh) set in httpOnly cookies
4. Frontend stores user data in Context
5. Protected routes verify authentication & role
6. Automatic token refresh on expiry

## 🎨 Design Principles

- **Security First**: httpOnly cookies, password hashing, input validation
- **Scalable Structure**: MVC backend, component-based frontend
- **User Experience**: Loading states, error handling, responsive design
- **Code Quality**: TypeScript, consistent naming, comments explaining WHY
- **Best Practices**: Environment variables, error boundaries, validation

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (Employer)
- `PUT /api/jobs/:id` - Update job (Employer)
- `DELETE /api/jobs/:id` - Delete job (Employer/Admin)

### Applications
- `POST /api/applications` - Apply for job (Candidate)
- `GET /api/applications/my-applications` - Get candidate's applications
- `GET /api/applications/job/:jobId` - Get job applications (Employer)
- `PUT /api/applications/:id/status` - Update status (Employer)

### Admin
- `GET /api/admin/dashboard` - Get analytics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/approve` - Approve employer
- `GET /api/admin/jobs` - Get all jobs

## 🛠️ Technologies Used

| Category | Technologies |
|----------|-------------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Validation | express-validator |
| HTTP Client | Axios |
| Dev Tools | nodemon, ESLint |

## 🎓 What You'll Learn

1. **Full-Stack Development**: End-to-end application development
2. **Authentication**: JWT-based auth with refresh tokens
3. **Authorization**: Role-based access control
4. **Database Design**: MongoDB schemas and relationship
5. **API Design**: RESTful principles and best practices
6. **Modern React**: Next.js App Router, Context API, TypeScript
7. **Security**: Password hashing, httpOnly cookies, input validation
8. **Code Organization**: MVC pattern, component architecture

## 🚦 Development Workflow

1. **Phase 1**: Project setup and architecture ✅
2. **Phase 2**: Backend authentication system ✅
3. **Phase 3**: Backend models and APIs ✅
4. **Phase 4**: Frontend authentication & layout ✅
5. **Phase 5**: Candidate features ✅
6. **Phase 6**: Employer features ✅
7. **Phase 7**: Admin panel (in progress)
8. **Phase 8**: Testing & verification

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

This is a learning project. Feel free to:
- Add new features
- Improve existing code
- Fix bugs
- Enhance documentation

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ as a MERN stack learning project**
