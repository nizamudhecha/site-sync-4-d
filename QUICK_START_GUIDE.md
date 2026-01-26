# 🚀 BuildTrack - Quick Start Guide

## Complete Setup in 10 Minutes

### ✅ Prerequisites Check

Before starting, make sure you have:

```bash
# Check Python version (need 3.9+)
python --version
# or
python3 --version

# Check Node.js version (need 16+)
node --version

# Check if you have yarn
yarn --version
# If not installed: npm install -g yarn

# Check MongoDB (optional for local development)
mongod --version
```

If any are missing:
- **Python**: Download from https://www.python.org/downloads/
- **Node.js**: Download from https://nodejs.org/
- **Yarn**: Run `npm install -g yarn`
- **MongoDB**: Download from https://www.mongodb.com/try/download/community

---

## 📦 STEP 1: Extract Your Project

```bash
# Navigate to your download folder
cd ~/Downloads

# Extract the package
tar -xzf DOWNLOAD-buildtrack-final-package.tar.gz

# Run automated setup script
chmod +x extract-and-setup.sh
./extract-and-setup.sh

# Navigate to project
cd buildtrack-project
```

**Manual extraction (if script doesn't work):**
```bash
tar -xzf DOWNLOAD-buildtrack-final-package.tar.gz
tar -xzf buildtrack-complete-project.tar.gz
mkdir buildtrack-project
mv backend frontend design_guidelines.json PROJECT_DOCUMENTATION.md buildtrack-project/
cd buildtrack-project
```

---

## 🗄️ STEP 2: Setup MongoDB (Choose One Option)

### Option A: Local MongoDB (Recommended for Development)

**On Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**On Ubuntu/Debian:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**On Windows:**
- Download from https://www.mongodb.com/try/download/community
- Install and run MongoDB as a service

**Verify it's running:**
```bash
mongosh
# You should see MongoDB shell
# Type 'exit' to quit
```

### Option B: MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `backend/.env`: `MONGO_URL="your_connection_string_here"`

---

## 🔧 STEP 3: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Edit the .env file
nano .env  # or use any text editor
```

**Update these values in `.env`:**
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="buildtrack_database"
CORS_ORIGINS="*"
JWT_SECRET="change-this-to-your-secret-key-12345"
RESEND_API_KEY="re_your_key_here"  # Optional: Get from https://resend.com
SENDER_EMAIL="onboarding@resend.dev"
```

**Important Notes:**
- `MONGO_URL`: Use `mongodb://localhost:27017` for local or your Atlas connection string
- `JWT_SECRET`: Change to any random string (keep it secret!)
- `RESEND_API_KEY`: Optional - only needed for email notifications

**Start the backend:**
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**✅ Backend is running at: http://localhost:8001**

**Test it:**
```bash
# In a new terminal
curl http://localhost:8001/api/
# Should return: {"detail":"Not Found"} - This is expected!
```

---

## 🎨 STEP 4: Setup Frontend

**Open a NEW terminal** (keep backend running)

```bash
# Navigate to frontend folder
cd buildtrack-project/frontend

# Install dependencies (this may take 2-3 minutes)
yarn install

# Verify environment configuration
cat .env
# Should show: REACT_APP_BACKEND_URL=http://localhost:8001
```

**If `.env` doesn't exist, create it:**
```bash
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
```

**Start the frontend:**
```bash
yarn start
```

**You should see:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**✅ Your browser should automatically open http://localhost:3000**

---

## 🎉 STEP 5: Create Your First Account

1. **You should see the login page** with construction background image
2. **Click "Don't have an account? Register"**
3. **Fill in the registration form:**
   - **Name**: Your Name
   - **Email**: admin@example.com
   - **Password**: YourSecurePassword123
   - **Role**: Select "Admin"
   - **Employee ID**: ADM-001 (optional)
4. **Click "Create Account"**
5. **You'll be automatically logged in to the Admin Dashboard!** 🎉

---

## 🏗️ STEP 6: Start Using BuildTrack

### As Admin, you can:

1. **Create a Project:**
   - Click "Projects" in sidebar
   - Click "Create Project" button
   - Fill in: Project name, client, location, dates, budget
   - Click "Create Project"

2. **Create Engineer Account:**
   - Logout (bottom of sidebar)
   - Register new account with Role: "Engineer"
   - Login as Admin again

3. **Assign Engineer to Project:**
   - Go to Projects
   - Click "Manage Engineers" on a project
   - Select engineers
   - Click "Assign Engineers"

4. **Create Schedule:**
   - Click "Schedules" in sidebar
   - Click "Add Schedule"
   - Select project, add phase name, dates
   - Click "Create Schedule"

### As Engineer (create & login):

1. **View Assigned Projects:**
   - Login with engineer account
   - See your assigned projects

2. **Upload Drawing:**
   - Click "Drawings" in sidebar
   - Click "Upload Drawing"
   - Select project, choose PDF/JPG file
   - Click "Upload"

3. **Request Material:**
   - Click "Materials" in sidebar
   - Click "Request Material"
   - Fill in material details
   - Click "Submit Request"

4. **Update Progress:**
   - Click "My Projects"
   - Click "Update Progress" on a project
   - Set percentage, add notes
   - Click "Update Progress"

### As Client (create & login):

1. **View Projects:**
   - Login with client account
   - See project progress (read-only)

2. **View Drawings:**
   - Go to "Projects"
   - Click on a project
   - View "Drawings" tab
   - Download approved drawings

---

## 🔍 STEP 7: Verify Everything Works

### Test Backend API:
```bash
# Get projects (will need token, but this tests connection)
curl http://localhost:8001/api/projects
```

### Check Frontend:
- ✅ Login page loads with construction image
- ✅ Can register new users
- ✅ Can login successfully
- ✅ Dashboard loads with stats
- ✅ Can navigate between pages

### Check MongoDB:
```bash
mongosh
use buildtrack_database
db.users.find()
# Should show your registered users
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to MongoDB"

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb  # Linux
brew services list  # Mac

# Start MongoDB if not running
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # Mac
```

### Issue 2: "Module not found" errors in backend

**Solution:**
```bash
cd backend
pip install -r requirements.txt --force-reinstall
```

### Issue 3: "yarn: command not found"

**Solution:**
```bash
npm install -g yarn
```

### Issue 4: Frontend shows blank page

**Solution:**
```bash
# Check browser console for errors (F12)
# Verify backend is running
curl http://localhost:8001/api/

# Clear cache and restart
cd frontend
rm -rf node_modules
yarn install
yarn start
```

### Issue 5: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000  # Windows, then kill PID

# Or use different port
PORT=3001 yarn start
```

### Issue 6: CORS errors

**Solution:**
- Make sure backend `.env` has: `CORS_ORIGINS="*"`
- Make sure frontend `.env` has correct backend URL
- Restart both backend and frontend

### Issue 7: File upload not working

**Solution:**
- Verify MongoDB is running (GridFS needs MongoDB)
- Check backend logs for errors
- Try with smaller file (<5MB)
- Verify file is PDF or JPG

---

## 📱 Access From Other Devices

### Same Network:

1. **Find your computer's IP:**
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

2. **Update frontend .env:**
```bash
# Replace localhost with your IP
REACT_APP_BACKEND_URL=http://192.168.1.100:8001
```

3. **Access from other device:**
- Open browser on phone/tablet
- Go to: `http://192.168.1.100:3000`

---

## 🛑 How to Stop the Application

### Stop Frontend:
- Press `Ctrl+C` in the terminal running `yarn start`

### Stop Backend:
- Press `Ctrl+C` in the terminal running `uvicorn`

### Stop MongoDB:
```bash
sudo systemctl stop mongodb  # Linux
brew services stop mongodb-community  # Mac
```

---

## 🔄 How to Restart

### Quick Restart:
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # if using virtual environment
uvicorn server:app --reload --port 8001

# Terminal 2: Frontend
cd frontend
yarn start
```

---

## 📊 Project URLs Reference

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8001 | API server |
| API Docs | http://localhost:8001/docs | Interactive API documentation |
| MongoDB | mongodb://localhost:27017 | Database connection |

---

## 🎯 Next Steps

Now that your project is running:

1. **Explore Features:**
   - Create projects
   - Upload drawings
   - Request materials
   - Create schedules
   - Test notifications

2. **Customize:**
   - Edit colors in `frontend/src/index.css`
   - Modify company name in `Login.js`
   - Add your logo

3. **Deploy (Optional):**
   - Frontend: Deploy to Vercel/Netlify
   - Backend: Deploy to Railway/Render/AWS
   - Database: Use MongoDB Atlas

4. **Add Features:**
   - More project fields
   - File types support
   - Advanced reporting
   - Mobile app

---

## 📚 Additional Resources

- **Full Documentation**: `PROJECT_DOCUMENTATION.md`
- **Design Guidelines**: `design_guidelines.json`
- **API Reference**: http://localhost:8001/docs (when backend is running)

---

## 💡 Pro Tips

1. **Use Virtual Environment for Python:**
   - Keeps dependencies isolated
   - Prevents conflicts with other projects

2. **Keep Backend Running:**
   - Use `screen` or `tmux` on Linux/Mac
   - Use Windows Terminal tabs

3. **Development Workflow:**
   - Backend auto-reloads on file changes
   - Frontend hot-reloads automatically
   - No need to restart for code changes!

4. **Database Backup:**
```bash
mongodump --db buildtrack_database --out ./backup
```

5. **Production Checklist:**
   - Change JWT_SECRET
   - Use HTTPS
   - Enable MongoDB authentication
   - Set CORS to specific domain
   - Add rate limiting

---

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] Backend started (port 8001)
- [ ] Frontend started (port 3000)
- [ ] Created admin account
- [ ] Created test project
- [ ] Created engineer account
- [ ] Assigned engineer to project
- [ ] Uploaded test drawing
- [ ] Requested test material
- [ ] Verified notifications work

---

## 🆘 Still Need Help?

If you encounter any issues:

1. Check the error message carefully
2. Look in browser console (F12)
3. Check backend terminal output
4. Verify all prerequisites are installed
5. Make sure ports 3000 and 8001 are free
6. Ensure MongoDB is running

**Common Commands for Debugging:**
```bash
# Check what's running on ports
lsof -i :3000
lsof -i :8001
lsof -i :27017

# Check MongoDB status
mongosh

# Check backend logs
cd backend
tail -f logs/app.log

# Restart everything fresh
# Kill all processes, restart MongoDB, then backend, then frontend
```

---

**🎉 Congratulations! Your BuildTrack project is now running!**

**Login at: http://localhost:3000**

Happy Building! 🏗️
