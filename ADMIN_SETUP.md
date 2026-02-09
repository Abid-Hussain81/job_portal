# Admin Setup Guide

This guide explains how to create and manage administrative accounts for the Job Portal application.

## Creating the First Admin Account

Since admin accounts can only be created by existing admins (for security), you need to bootstrap the first admin account using the setup script.

### Method 1: Using the Setup Script (Recommended)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Run the admin setup script:**
   ```bash
   node scripts/createAdmin.js
   ```

3. **Follow the interactive prompts:**
   - Enter admin name
   - Enter admin email (must be unique)
   - Enter password (minimum 6 characters)
   - Enter phone number (optional)

4. **Example output:**
   ```
   === Create New Admin Account ===

   Admin Name: Abid Hussain
   Admin Email: admin@jobportal.com
   Admin Password (min 6 characters): ******
   Phone Number (optional): +1234567890

   ✓ Admin account created successfully!

   === Admin Details ===
   Name: John Doe
   Email: admin@jobportal.com
   Role: admin
   ID: 507f1f77bcf86cd799439011

   You can now login at: http://localhost:3000/admin/login
   ```

### Method 2: Manual Database Insert

If you prefer, you can manually insert an admin user into MongoDB:

1. **Connect to MongoDB:**
   ```bash
   mongosh
   ```

2. **Switch to your  database:**
   ```javascript
   use job-portal
   ```

3. **Insert an admin user:**
   ```javascript
   db.users.insertOne({
     name: "Admin User",
     email: "admin@example.com",
     password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
     role: "admin",
     isApproved: true,
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

   **Note:** You'll need to hash the password using bcrypt before inserting.

## Logging In as Admin

1. Navigate to the admin login page: `http://localhost:3000/admin/login`
2. Enter your admin credentials
3. You'll be redirected to the admin dashboard

## Creating Additional Admin Accounts

Once logged in as an admin, you can create additional admin accounts through the web interface:

1. **Go to User Management:**
   - Click on "User Management" from the admin dashboard
   - Or navigate to `/admin/users`

2. **Click "Authorize Admin" button**

3. **Fill in the form:**
   - Legal Name
   - Secure Email
   - Initial Key (password)
   - Contact Link (phone - optional)

4. **Click "Grant Access"**

The new admin account will be created immediately and can be used to log in.

## Admin Panel Features

### Dashboard (`/admin/dashboard`)
- View system-wide statistics
- Monitor user counts, job postings, applications
- Quick access to management tools

### User Management (`/admin/users`)
- View all users in the system
- Create new admin accounts
- Activate/deactivate user accounts
- Delete users (soft delete)
- Filter and search users

### Employer Management (`/admin/employers`)
- Review pending employer registrations
- Approve or reject employer accounts
- Search and filter employers
- View employer details

### Job Management (`/admin/jobs`)
- View all job postings
- Moderate job content
- Update job status (active/inactive/expired)
- Monitor job listings

### Admin Profile (`/admin/profile`)
- Update your name and phone number
- View your admin credentials
- Access admin identity information

## Security Notes

- **Initial Admin:** The first admin account should be created securely using the setup script
- **Strong Passwords:** Always use strong passwords for admin accounts
- **Limited Access:** Only create admin accounts for trusted individuals
- **Regular Audits:** Regularly review admin account list for unauthorized access

## Troubleshooting

### Can't run the setup script?
- Ensure Node.js is installed
- Make sure you're in the `backend` directory
- Verify MongoDB connection in your `.env` file

### Setup script says admin already exists?
- You can proceed to create another admin by typing "yes" when prompted
- Or skip and login with the existing admin credentials

### Forgot admin password?
- Use the setup script to create a new admin account
- Or manually reset the password in the database

## Environment Variables

Make sure your `.env` file has the correct MongoDB connection:

```env
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your-secret-key
PORT=5000
```

## Next Steps

After creating your admin account:

1. Login to the admin panel
2. Review pending employer applications
3. Configure system settings
4. Monitor user activity
5. Moderate content as needed

For more information, see the main README.md file.
