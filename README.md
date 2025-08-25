# Lead Management System

A full-stack Lead Management System built for the Erino SDE Internship Assignment.

## Tech Stack
- **Frontend**: React.js with AG Grid
- **Backend**: Express.js with JWT authentication
- **Database**: MongoDB
- **Authentication**: JWT with httpOnly cookies

## Features
- User registration and login with JWT authentication
- CRUD operations for leads
- Server-side pagination and filtering
- Responsive grid interface with AG Grid
- Secure authentication with httpOnly cookies

## Project Structure
```
├── backend/          # Express.js API server
├── frontend/         # React.js application
└── README.md
```

## Getting Started

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Leads
- `POST /api/leads` - Create lead
- `GET /api/leads` - List leads (with pagination & filters)
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

## Deployment

### Backend Deployment (Render)

1. **Create MongoDB Atlas Database**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a free cluster
   - Get your connection string

2. **Deploy to Render**
   - Go to [Render](https://render.com/)
   - Connect your GitHub repository
   - Create a new Web Service
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Set environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

3. **Run Seed Script** (after deployment)
   - In Render dashboard, go to your service
   - Open Shell and run: `npm run seed`

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com/)
   - Import your GitHub repository
   - Set framework preset: **Create React App**
   - Set root directory: `frontend`
   - Set build command: `npm run build`
   - Set output directory: `build`
   - Add environment variable:
     ```
     REACT_APP_API_URL=https://your-backend-url.onrender.com
     ```

2. **Alternative: Manual Deployment**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy from frontend directory
   cd frontend
   vercel --prod
   ```

### Environment Variables Summary

**Backend (.env)**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lead_management
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Frontend**
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## Test User Credentials
After running the seed script, use these credentials:
- **Email**: test@example.com
- **Password**: testpassword123
- **Leads**: 150+ sample leads included

## Live Demo
- **Frontend**: [Your Vercel URL]
- **Backend API**: [Your Render URL]
