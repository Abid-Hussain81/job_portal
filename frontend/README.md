# MERN Job Portal - Frontend

Modern, production-ready job portal frontend built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

### For Candidates
- ✅ Browse jobs with advanced filters (location, job type, experience, salary)
- ✅ Search functionality
- ✅ View detailed job descriptions
- ✅ Apply for jobs with cover letter and resume
- ✅ Track application status in dashboard
- ⏳ Profile management (coming soon)

### For Employers
- ✅ Dashboard with job statistics
- ✅ Post new jobs with comprehensive details
- ✅ View all applicants for each job
- ✅ Shortlist, accept, or reject candidates
- ⏳ Edit/close job postings (coming soon)

### For Admins
- ⏳ Dashboard with system analytics (coming soon)
- ⏳ User management (coming soon)
- ⏳ Employer approval system (coming soon)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Authentication**: JWT with httpOnly cookies

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Auth pages (login, register)
│   ├── candidate/           # Candidate-specific pages
│   │   ├── jobs/           # Job browsing & details
│   │   └── dashboard/      # Application tracking
│   ├── employer/            # Employer-specific pages
│   │   ├── dashboard/      # Employer dashboard
│   │   ├── jobs/new/       # Post new job
│   │   └── applicants/     # View applicants
│   ├── admin/               # Admin pages (coming soon)
│   ├── layout.tsx           # Root layout with AuthProvider
│   └── page.tsx             # Landing page
├── components/              # Reusable components
│   ├── Navbar.tsx          # Role-based navigation
│   └── ProtectedRoute.tsx  # Route protection HOC
├── contexts/                # React contexts
│   └── AuthContext.tsx     # Authentication state
├── lib/                     # Utilities
│   ├── api.ts              # Axios instance
│   └── auth.ts             # Auth helpers
└── public/                  # Static assets
```

## 🔧 Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend sets httpOnly cookies with JWT tokens
3. Frontend stores user data in Context
4. Protected routes check authentication & role
5. API requests automatically include cookies
6. Token refresh happens automatically on expiry

## 🎨 Design Features

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface
- **Role-Based Navigation**: Different menus for different user types
- **Status Badges**: Color-coded application/job statuses
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages

## 📝 Key Components

### ProtectedRoute
Wraps pages that require authentication and specific roles:
```tsx
<ProtectedRoute allowedRoles={['candidate']}>
  <YourPage />
</ProtectedRoute>
```

### AuthContext
Provides authentication state globally:
```tsx
const { user, login, logout, loading } = useAuth();
```

### API Client
Centralized Axios instance with automatic token refresh:
```tsx
import api from '@/lib/api';
const response = await api.get('/jobs');
```

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔗 API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`:

- **Auth**: `/auth/register`, `/auth/login`, `/auth/logout`
- **Jobs**: `/jobs`, `/jobs/:id`
- **Applications**: `/applications`, `/applications/my-applications`
- **Admin**: `/admin/*` (coming soon)

## 🎯 Next Steps

1. ✅ Complete candidate profile management
2. ✅ Add job edit/delete functionality for employers
3. ✅ Build admin dashboard and user management
4. ✅ Add file upload for resumes
5. ✅ Implement real-time notifications
6. ✅ Add advanced search with Elasticsearch

## 📄 License

This project is part of a MERN stack learning exercise.
