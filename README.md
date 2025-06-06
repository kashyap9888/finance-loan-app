# Finance Loan App

A finance loan application with user and admin features.

## Features

### User Features

- **Registration**: Full name, mobile number, city, permissions (location, contacts), profile photo
- **Login**: Mobile number with OTP verification
- **Loan Application**: PAN, Aadhaar, salary slips, bank details, live photo
- **Dashboard**: View loan status and details

### Admin Features

- **Login**: Email/password authentication
- **Dashboard**: View all loan applications
- **CRUD Operations**: Approve/reject loans with reason, delete loans
- **Filter**: Filter applications by city

## Backend Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env` file:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/finance-app
   JWT_SECRET=your_jwt_secret_key
   ```
4. Run the setup script to create the default admin:
   ```
   node test-backend.js
   ```
5. Start the server:
   ```
   npm start
   ```

## Default Admin Credentials

- Email: admin@example.com
- Password: admin123

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Send OTP for login
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/profile` - Get user profile

### Loan

- `POST /api/loan/apply` - Apply for a loan
- `GET /api/loan/status` - Get loan status
- `GET /api/loan/details/:id` - Get loan details
- `POST /api/loan/disburse/:id` - Disburse an approved loan

### Admin

- `POST /api/admin/login` - Admin login
- `GET /api/admin/loans` - Get all loan applications
- `GET /api/admin/cities` - Get unique cities for filtering
- `PUT /api/admin/loans/:id/approve` - Approve a loan
- `PUT /api/admin/loans/:id/reject` - Reject a loan with reason
- `DELETE /api/admin/loans/:id` - Delete a loan (soft delete)
- `POST /api/admin/setup` - Create default admin if none exists

## Frontend

The frontend is built with Next.js and can be found in the repository.
