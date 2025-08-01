# MindMitra Deployment Guide

## 🔧 Database Setup & Troubleshooting

### MongoDB Atlas Configuration

1. **Check Cluster Status**
   - Login to [MongoDB Atlas](https://cloud.mongodb.com)
   - Ensure your cluster is running (not paused)
   - Verify cluster region and configuration

2. **Network Access (Critical)**
   - Go to "Network Access" in Atlas dashboard
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Or add your specific IP addresses

3. **Database User Permissions**
   - Go to "Database Access"
   - Ensure user `mental-health-project` has:
     - Database User Privileges: `Atlas admin` or `Read and write to any database`
     - Authentication Method: `Password`

4. **Connection String Verification**
   ```
   mongodb+srv://mental-health-project:gWh94Sa8vhaeYkOt@mental-health-cluster.ql0vnjz.mongodb.net/?retryWrites=true&w=majority&appName=mental-health-cluster
   ```

### Testing Database Connection

Create a simple connection test:

```javascript
// test-db.js
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

Run: `node test-db.js`

## 🚀 Deployment Strategy

### Option 1: Separate Frontend & Backend (Recommended)

#### Frontend → Vercel
#### Backend → Render

### Option 2: Full-Stack on Single Platform
#### Both → Render

---

## 📦 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. **Create separate frontend directory**
   ```bash
   mkdir mindmitra-frontend
   cd mindmitra-frontend
   ```

2. **Copy frontend files**
   ```
   mindmitra-frontend/
   ├── index.html
   ├── styles.css
   ├── script.js
   └── package.json (optional)
   ```

3. **Update API URLs in script.js**
   Replace all API calls from `/api/` to your Render backend URL:
   ```javascript
   const API_BASE_URL = 'https://your-render-app.onrender.com/api';
   
   // Example:
   fetch(`${API_BASE_URL}/auth/login`, {
     // ... rest of the code
   })
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd mindmitra-frontend
   vercel
   ```

4. **Configure Vercel (vercel.json)**
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           }
         ]
       }
     ]
   }
   ```

---

## 🖥 Backend Deployment (Render)

### Step 1: Prepare Backend

1. **Create backend-only directory**
   ```bash
   mkdir mindmitra-backend
   ```

2. **Copy backend files**
   ```
   mindmitra-backend/
   ├── server.js
   ├── package.json
   ├── models/
   ├── routes/
   ├── middleware/
   ├── seed.js
   └── .env.example
   ```

3. **Update CORS configuration**
   ```javascript
   // In server.js
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://your-vercel-app.vercel.app'
     ],
     credentials: true
   }));
   ```

### Step 2: Deploy to Render

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/mindmitra-backend.git
   git push -u origin main
   ```

2. **Create Render Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: mindmitra-backend
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Environment Variables on Render**
   ```
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<secure-random-string>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   NODE_ENV=production
   SESSION_SECRET=mindmitra_session_secret_2024_secure
   ```

---

## 🔄 Alternative: Full-Stack Render Deployment

### Step 1: Modify Project Structure

```
mindmitra/
├── server.js
├── package.json
├── models/
├── routes/
├── middleware/
├── client/          # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── build.sh         # Build script
```

### Step 2: Create Build Script

```bash
#!/bin/bash
# build.sh
echo "Building MindMitra..."
npm install
echo "Build complete!"
```

### Step 3: Update server.js

```javascript
// Serve static files from client directory
app.use(express.static(path.join(__dirname, 'client')));

// Serve main HTML file for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});
```

### Step 4: Deploy to Render

- **Build Command**: `chmod +x build.sh && ./build.sh`
- **Start Command**: `npm start`

---

## 🧪 Testing Deployment

### Health Check Endpoints

1. **Backend Health**: `https://your-render-app.onrender.com/api/health`
2. **Database Status**: `https://your-render-app.onrender.com/api/health/db`

### Sample API Tests

```bash
# Test authentication
curl -X POST https://your-render-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mindmitra.com","password":"admin123"}'

# Test resources
curl https://your-render-app.onrender.com/api/resources
```

---

## 🔐 Security Checklist

- [ ] Environment variables set correctly
- [ ] CORS configured for production domains
- [ ] MongoDB IP whitelist updated
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Rate limiting configured
- [ ] Input validation in place

---

## 📋 Post-Deployment Steps

1. **Seed Database**
   ```bash
   # Run on Render console or locally pointing to production DB
   npm run seed
   ```

2. **Test All Features**
   - User registration/login
   - Google OAuth
   - Resource loading
   - Journal entries
   - Forum posts
   - Mood tracking
   - Chat functionality

3. **Monitor Performance**
   - Check Render logs
   - Monitor MongoDB Atlas metrics
   - Test load times

---

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CORS origin in backend
   - Check frontend API URLs

2. **Database Connection**
   - Verify MongoDB Atlas IP whitelist
   - Check connection string
   - Ensure cluster is running

3. **Environment Variables**
   - Double-check all variables are set
   - No trailing spaces or quotes

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies in package.json

### Support Commands

```bash
# Check logs on Render
render logs

# Test database connection
node test-db.js

# Verify environment variables
node -e "console.log(process.env.MONGODB_URI)"
```

---

## 📞 Next Steps

1. Fix MongoDB connection issue
2. Choose deployment strategy (separate or combined)
3. Set up GitHub repositories
4. Deploy backend to Render
5. Deploy frontend to Vercel (if separate)
6. Test all functionality
7. Seed production database

Would you like me to help you with any specific step?
